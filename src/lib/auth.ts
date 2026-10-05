import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getJwtSecret } from "@/lib/jwt-secret";

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "STUDENT";
}
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("docsearch_token")?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch (err) {
    return null;
  }
}

export function setTokenCookie(token: string) {
  try {
    const cookieStore = cookies();
    cookieStore.set("docsearch_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
  } catch (err) {
    console.warn("setTokenCookie skipped in current context:", err);
  }
}

export function removeTokenCookie() {
  try {
    const cookieStore = cookies();
    cookieStore.delete("docsearch_token");
  } catch (err) {
    console.warn("removeTokenCookie skipped in current context:", err);
  }
}
