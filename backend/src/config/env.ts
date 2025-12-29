import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  NODE_ENV: string;
}


const getEnvConfig = (): EnvConfig => {
  const { PORT, MONGO_URI, NODE_ENV } = process.env;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  return {
    PORT: PORT ? parseInt(PORT, 10) : 5000,
    MONGO_URI,
    NODE_ENV: NODE_ENV || "development",
  };
};

export const env = getEnvConfig();
