import { sign, verify } from "hono/jwt";
import { CookieOptions } from "hono/utils/cookie";
import { JWTPayload } from "hono/utils/jwt/types";

interface JwtSecret {
  jwt: string;
  options: CookieOptions;
}

const thirtyDaysFromNow = (): Date =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

export const getJWTAndOption = async (
  payload: JWTPayload,
  secret: string
): Promise<JwtSecret> => {
  const jwt = await sign(payload, secret);
  const options: CookieOptions = {
    sameSite: "Strict",
    httpOnly: true,
    secure: true,
    expires: thirtyDaysFromNow(),
  };
  return { jwt, options };
};

export const hashPassword = async (
  password: string,
  providedSalt?: Uint8Array
): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = providedSalt || crypto.getRandomValues(new Uint8Array(8));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exportedKey = (await crypto.subtle.exportKey(
    "raw",
    key
  )) as ArrayBuffer;
  const hashBuffer = new Uint8Array(exportedKey);
  const hashArray = Array.from(hashBuffer);
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${saltHex}:${hashHex}`;
};

export const verifyPassword = async (
  storedHash: string,
  passwordAttempt: string
): Promise<boolean> => {
  const [saltHex, originalHash] = storedHash.split(":");
  const matchResult = saltHex.match(/.{1,2}/g);
  if (!matchResult) {
    throw new Error("Invalid salt format");
  }
  const salt = new Uint8Array(matchResult.map((byte) => parseInt(byte, 16)));
  const attemptHashWithSalt = await hashPassword(passwordAttempt, salt);
  const [, attemptHash] = attemptHashWithSalt.split(":");
  return attemptHash === originalHash;
};
