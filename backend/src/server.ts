import app from "./app.js";
import dbConnect from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    await dbConnect();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
