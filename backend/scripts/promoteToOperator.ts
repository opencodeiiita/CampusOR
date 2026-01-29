
import mongoose from "mongoose";
import { User } from "../src/modules/auth/user.model";
import { env } from "../src/config/env";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually since we are running a script
dotenv.config({ path: path.join(__dirname, "../../.env") });

const promoteUser = async () => {
    try {
        const args = process.argv.slice(2);
        const email = args[0];

        if (!email) {
            console.error("Please provide an email address.");
            console.log("Usage: npx ts-node scripts/promoteToOperator.ts <email>");
            process.exit(1);
        }

        console.log("Connecting to database...");
        await mongoose.connect(env.MONGO_URI as string);
        console.log("Connected.");

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.role})`);

        if (user.role === "operator") {
            console.log("User is already an operator.");
            process.exit(0);
        }

        user.role = "operator";
        user.department = user.department || "Test Dept";
        user.position = user.position || "Test Operator";
        await user.save();

        console.log(`✅ Successfully promoted ${user.name} (${email}) to OPERATOR.`);

    } catch (error) {
        console.error("Error promoting user:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

promoteUser();
