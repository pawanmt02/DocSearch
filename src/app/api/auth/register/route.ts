import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setTokenCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email address, and password are required" },
        { status: 400 }
      );
    }

    const cleanedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Create new STUDENT account (PDR Rule: Public registration is strictly restricted to STUDENT role)
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanedEmail,
        password: password, // Simple string for demo
        role: "STUDENT",
      },
    });

    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: "STUDENT" as const,
    };

    // Generate JWT and set HTTP-only cookie
    const token = await signToken(payload);
    setTokenCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Student account created successfully!",
        user: payload,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Student Registration API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during student registration" },
      { status: 500 }
    );
  }
}
