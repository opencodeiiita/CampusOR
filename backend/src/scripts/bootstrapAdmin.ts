import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../modules/auth/user.model.js";
import bcrypt from "bcryptjs";

async function bootstrapAdmin() {
  await mongoose.connect(process.env.MONGO_URI!);

  const adminExists = await User.exists({ role: "admin" });

  if (adminExists) {
    console.log("❌ Admin already exists. Bootstrap aborted.");
    process.exit(0);
  }

  const { BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD } = process.env;

  if (!BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD) {
    throw new Error("Bootstrap admin env vars missing");
  }

  const passwordHash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, 12);

  await User.create({
    name: "System Admin",
    email: BOOTSTRAP_ADMIN_EMAIL,
    password: passwordHash,
    role: "admin",
    emailVerified: true,
  });

  console.log("✅ Bootstrap admin created successfully");
  process.exit(0);
}

bootstrapAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
