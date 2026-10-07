export function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
      ? process.env.JWT_SECRET
      : "docsearch-super-secure-jwt-secret-key-32chars-fallback-2026";

  return new TextEncoder().encode(secret);
}

