import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSession, removeTokenCookie } from "@/lib/auth";
import { prisma, DEMO_USERS } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  let currentPassword = "";
  let userFound = false;

  // Try DB
  try {
    if (prisma && prisma.user) {
      const dbUser = await prisma.user.findUnique({ where: { id: session.id } });
      if (dbUser) {
        currentPassword = dbUser.password;
        userFound = true;
      }
    }
  } catch (err) {}

  // Fallback to DEMO_USERS
  if (!userFound) {
    const demoUser = DEMO_USERS.find((u) => u.id === session.id);
    if (demoUser) {
      currentPassword = demoUser.password;
      userFound = true;
    }
  }

  if (userFound && session.pwdHash) {
    const currentHash = crypto.createHash("sha256").update(currentPassword || "").digest("hex");
    if (currentHash !== session.pwdHash) {
      // Password was changed! Force logout.
      const response = NextResponse.json({ authenticated: false, user: null, reason: "password_changed" }, { status: 401 });
      response.cookies.delete("docsearch_token");
      return response;
    }
  }

  return NextResponse.json({ authenticated: true, user: session });
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPassword } = await request.json();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Try updating DB
    let updated = false;
    try {
      if (prisma && prisma.user) {
        await prisma.user.update({
          where: { id: session.id },
          data: { password: newPassword },
        });
        updated = true;
      }
    } catch (dbErr) {
      console.warn("DB update failed on Vercel, trying in-memory DEMO_USERS");
    }

    // If DB fails (like on Vercel), update in-memory DEMO_USERS array
    if (!updated) {
      const demoUser = DEMO_USERS.find((u) => u.id === session.id);
      if (demoUser) {
        demoUser.password = newPassword;
      }
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
