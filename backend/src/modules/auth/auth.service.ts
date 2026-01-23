import { User, UserRole, IUser } from "./user.model.js";
import { AdminInvite } from "../admin/admin-invite.model.js";
import bcrypt from "bcryptjs"; // for encrypting and matching the password
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { sendEmailVerificationOtp } from "../notifications/email.service.js";

const SALT = 10;
const OTP_EXPIRY_MINUTES = 10;

export class AuthError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

//----------------REGISTER SERVICE----------------------------------------
export interface RegisterDetails {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  // Role-specific fields
  collegeEmail?: string; // Required for "user" role
  department?: string; // Required for "operator" role
  position?: string; // Required for "operator" role
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  collegeEmail?: string;
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ResendOtpInput {
  email: string;
}

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const buildSafeUser = (user: IUser): SafeUser => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: !!user.emailVerified,
    collegeEmail: user.collegeEmail,
    department: user.department,
    position: user.position,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const signToken = (safeUser: SafeUser): string => {
  const payload = {
    sub: safeUser.id, // subject
    role: safeUser.role,
  };

  const signOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_SECRET, signOptions);
};

const applyEmailOtp = async (user: IUser): Promise<{ otp: string }> => {
  const otp = generateOtp();

  user.emailOtpHash = await bcrypt.hash(otp, SALT);
  user.emailOtpExpiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await user.save();

  if (env.NODE_ENV !== "production") {
    console.info(
      ` OTP for ${user.email}: ${otp} (expires in ${OTP_EXPIRY_MINUTES}m)`
    );
  }

  return { otp };
};

export const registerUser = async (
  input: RegisterDetails
): Promise<SafeUser> => {
  const { name, email, password, role, collegeEmail, department, position } = input;
  
  const finalRole = role || "user";

  if (finalRole === "user") {
    if (!collegeEmail) {
      throw new Error("College email is required for user role");
    }
  } else if (finalRole === "operator") {
    if (!department) {
      throw new Error("Department is required for operator role");
    }
    if (!position) {
      throw new Error("Position is required for operator role");
    }
  }

  // if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AuthError(
      "Email is already registered. Please login or verify your email.",
      400,
      "EMAIL_TAKEN"
    );
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, SALT);

  const userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    emailVerified: boolean;
    collegeEmail?: string;
    department?: string;
    position?: string;
  } = {
    name,
    email,
    password: hashedPassword,
    role: finalRole,
    emailVerified: false,
  };

  if (finalRole === "user" && collegeEmail) {
    userData.collegeEmail = collegeEmail;
  } else if (finalRole === "operator") {
    if (department) userData.department = department;
    if (position) userData.position = position;
  }

  // create user in DB
  const userResult = await User.create(userData);
  const user = Array.isArray(userResult) ? userResult[0] : userResult;

  const { otp } = await applyEmailOtp(user);

  try {
    await sendEmailVerificationOtp(user.email, user.name, otp, OTP_EXPIRY_MINUTES);
  } catch (error) {
    // Email failures should not block signup
    console.error("Failed to send verification email:", error);
  }

  return buildSafeUser(user);
};

///-------------------------LOGIN SERVICE---------------------------------------------

export interface LoginDetails {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: SafeUser;
}

export const loginUser = async (input: LoginDetails): Promise<LoginResult> => {
  const { email, password } = input;

  // 1) Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  // 2) Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthError("Invalid email or password", 401);
  }

  if (!user.emailVerified) {
    throw new AuthError(
      "Email not verified. Please verify your email to continue.",
      403,
      "EMAIL_NOT_VERIFIED"
    );
  }

  const safeUser = buildSafeUser(user);
  const token = signToken(safeUser);

  return { token, user: safeUser };
};

export const verifyEmailOtp = async (
  input: VerifyOtpInput
): Promise<LoginResult> => {
  const { email, otp } = input;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AuthError("User not found", 404);
  }

  if (user.emailVerified) {
    throw new AuthError("Email already verified", 400, "ALREADY_VERIFIED");
  }

  if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
    throw new AuthError(
      "No OTP found. Please request a new code.",
      400,
      "OTP_MISSING"
    );
  }

  if (user.emailOtpExpiresAt.getTime() < Date.now()) {
    throw new AuthError(
      "OTP expired. Please request a new code.",
      400,
      "OTP_EXPIRED"
    );
  }

  const isMatch = await bcrypt.compare(otp, user.emailOtpHash || "");

  if (!isMatch) {
    throw new AuthError("Invalid OTP. Please try again.", 400, "OTP_INVALID");
  }

  user.emailVerified = true;
  user.emailOtpHash = null;
  user.emailOtpExpiresAt = null;

  await user.save();

  const safeUser = buildSafeUser(user);
  const token = signToken(safeUser);

  return { token, user: safeUser };
};

export const resendEmailOtp = async (
  input: ResendOtpInput
): Promise<{ message: string }> => {
  const { email } = input;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AuthError("User not found", 404);
  }

  if (user.emailVerified) {
    throw new AuthError("Email is already verified", 400, "ALREADY_VERIFIED");
  }

  const { otp } = await applyEmailOtp(user);

  try {
    await sendEmailVerificationOtp(
      user.email,
      user.name,
      otp,
      OTP_EXPIRY_MINUTES
    );
  } catch (error) {
    console.error("Failed to resend verification email:", error);
  }

  return { message: "A new OTP has been sent to your email." };
};

///-------------------------CREATE ADMIN USER SERVICE---------------------------------------------

export interface CreateAdminDetails {
  name: string;
  email: string;
  password: string;
  createdByAdminId: string;
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
}

export const createAdminUser = async (
  input: CreateAdminDetails
): Promise<CreateAdminResponse> => {
  const { name, email, password, createdByAdminId } = input;

  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email or college email is already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT);

  // Create admin user in DB
  const userData = {
    name,
    email,
    password: hashedPassword,
    role: "admin" as UserRole,
    emailVerified: false,
    createdByAdmin: createdByAdminId
  };

  const userResult = await User.create(userData);
  const user = Array.isArray(userResult) ? userResult[0] : userResult;

  const { otp } = await applyEmailOtp(user);

  try {
    await sendEmailVerificationOtp(user.email, user.name, otp, OTP_EXPIRY_MINUTES);
  } catch (error) {
    // Email failures should not block signup
    console.error("Failed to send verification email:", error);
  }

  return {
    success: true,
    message: "Admin invitation sent"
  };
};

///-------------------------ACCEPT ADMIN INVITE SERVICE---------------------------------------------

export interface AcceptAdminInviteDetails {
  email: string;
  token: string;
  name: string;
  password: string;
}

export const acceptAdminInvite = async (
  input: AcceptAdminInviteDetails
): Promise<LoginResult> => {
  const { email, token, name, password } = input;

  // Find the invite
  const crypto = await import("crypto");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const invite = await AdminInvite.findOne({
    email,
    token: hashedToken,
    isUsed: false,
  });

  if (!invite) {
    throw new AuthError("Invalid or used invitation link", 400);
  }

  // Check expiry
  if (invite.expiresAt < new Date()) {
    throw new AuthError("Invitation expired", 400);
  }

  // Create User
  const existing = await User.findOne({ email });
  if (existing) {
     // For simplicity and security, invite flow usually creates the account.
     throw new AuthError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, SALT);

  const userData = {
    name,
    email,
    password: hashedPassword,
    role: "admin" as UserRole,
    emailVerified: true, // Trusted via email link
    createdByAdmin: invite.createdBy,
  };

  const userResult = await User.create(userData);
  const user = Array.isArray(userResult) ? userResult[0] : userResult;
  
  // Mark invite as used
  invite.isUsed = true;
  await invite.save();

  const safeUser = buildSafeUser(user);
  const jwtToken = signToken(safeUser);

  return { token: jwtToken, user: safeUser };
};
