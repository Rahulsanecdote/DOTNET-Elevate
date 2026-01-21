'use client';

/**
 * Normalizes a string for hashing by trimming, collapsing whitespace, and converting to lower case.
 * @param str The input string.
 * @returns The normalized string.
 */
function normalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Computes a stable SHA-256 hash from resume, job description, and role inputs.
 * This is used for caching to avoid regenerating kits for the same inputs.
 * The function is designed to be deterministic, ensuring the same inputs produce the same hash.
 *
 * @param parts An object containing optional resume, jd, and targetRole strings.
 * @returns A promise that resolves to the hex-encoded SHA-256 hash.
 */
export async function computeInputHash(parts: {
  resume?: string;
  jd?: string;
  targetRole?: string;
}): Promise<string> {
  // 1. Canonicalize the input parts into a stable string format.
  // Keys (e.g., "resume:") and separators (|) are used to prevent hash collisions,
  // ensuring that swapping resume and JD content would produce a different hash.
  const canonicalString = [
    `resume:${normalize(parts.resume)}`,
    `jd:${normalize(parts.jd)}`,
    `role:${normalize(parts.targetRole)}`,
  ].join('|');

  // 2. Encode the canonical string into a Uint8Array buffer.
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalString);

  // 3. Compute the SHA-256 hash using the browser's built-in Web Crypto API.
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // 4. Convert the resulting ArrayBuffer to a hexadecimal string.
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}
