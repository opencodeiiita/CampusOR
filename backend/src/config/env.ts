import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL:string;
}

const getEnvConfig = (): EnvConfig => {
  const { PORT, MONGO_URI, NODE_ENV, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL } = process.env;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  if (!JWT_SECRET) {
    throw new Error("JWT SECRET is not valid");
  }

  if (!JWT_EXPIRES_IN) {
    throw new Error("JWT EXPIRES IN is not valid");
  }

  return {
    PORT: PORT ? parseInt(PORT, 10) : 5000,
    MONGO_URI,
    NODE_ENV: NODE_ENV || "development",
    JWT_SECRET,
    JWT_EXPIRES_IN: JWT_EXPIRES_IN || "1h",
    FRONTEND_URL: FRONTEND_URL || "http://localhost:3000"
  };
};

export const env = getEnvConfig();
