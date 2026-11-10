// Tiện ích xác thực, băm mật khẩu và quản lý JWT Token
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET_STRING = process.env.AUTH_SECRET || "quickquiz-super-secure-jwt-secret-key-24092005";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Băm mật khẩu bằng bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// So khớp mật khẩu đã băm
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Kiểm tra mật khẩu đạt chuẩn bảo mật: ít nhất 8 ký tự, gồm tối thiểu 1 chữ cái, 1 số và 1 ký tự đặc biệt
export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 8 ký tự!" };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { isValid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ cái (a-z, A-Z)!" };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)!" };
  }
  if (!/[@$!%*#?&^_~-]/.test(password)) {
    return { isValid: false, message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: @, $, !, %, *, #, ?, &, _, -)!" };
  }
  return { isValid: true, message: "" };
}

// Tạo JWT Token có thời hạn 7 ngày
export async function createToken(payload: AuthUserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Xác thực và giải mã JWT Token
export async function verifyToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role as string) || "USER",
    };
  } catch {
    return null;
  }
}

// Lấy thông tin người dùng từ Cookie phiên làm việc
export async function getAuthUser(): Promise<AuthUserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

// Tạo Token OTP có thời hạn 5 phút phục vụ đặt lại mật khẩu
export async function createOtpToken(email: string, otpHash: string): Promise<string> {
  return new SignJWT({ email, otpHash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m") // Hiệu lực đúng 5 phút
    .sign(JWT_SECRET);
}

// Xác thực Token OTP và lấy email, otpHash
export async function verifyOtpToken(token: string): Promise<{ email: string; otpHash: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      email: payload.email as string,
      otpHash: payload.otpHash as string,
    };
  } catch {
    return null;
  }
}

