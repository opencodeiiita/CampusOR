
import mongoose from "mongoose";
import { User } from "../src/modules/auth/user.model";
import { env } from "../src/config/env";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const createTestUser = async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(env.MONGO_URI as string);
        console.log("Connected.");

        const email = "test-user@campusor.com";
        const password = "password123";

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log("Test user already exists. Using existing user.");
            // Ensure user role is 'user'
            if (user.role !== "user") {
                user.role = "user";
                await user.save();
                console.log("Reset role to 'user'.");
            }
        } else {
            console.log("Creating new test user...");
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                name: "Test User",
                email,
                password: hashedPassword,
                role: "user",
                collegeEmail: "test@campus.edu",
                emailVerified: true, // Auto-verified
            });
            console.log("Test user created.");
        }

        // Generate JWT
        const payload = {
            sub: user._id.toString(),
            role: user.role,
        };

        const token = jwt.sign(payload, env.JWT_SECRET as string, {
            expiresIn: "24h",
        });

        console.log("\n==================================================");
        console.log("✅ TEST USER READY");
        console.log("==================================================");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("Role: user");
        console.log("--------------------------------------------------");
        console.log("🔑 JWT TOKEN (Use this to login without password):");
        console.log(token);
        console.log("==================================================");
        console.log("\nINSTRUCTIONS:");
        console.log("1. Open an Incognito Window or different browser.");
        console.log("2. Open Developer Tools (F12) -> Console.");
        console.log("3. Run the following command locally:");
        console.log(`   localStorage.setItem("campusor_jwt", "${token}")`);
        console.log("4. Navigate to http://localhost:3000/dashboard/user");
        console.log("   (You should be logged in automatically)");
        console.log("==================================================");

    } catch (error) {
        console.error("Error creating test user:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createTestUser();
