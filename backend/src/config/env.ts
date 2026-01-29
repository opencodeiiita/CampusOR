import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  REDIS_URL: string;
  // Rate limiting config
  QUEUE_JOIN_COOLDOWN_SECONDS: number;
  QUEUE_JOIN_RATE_LIMIT_PER_MIN: number;
  QUEUE_JOIN_RATE_LIMIT_PER_HOUR: number;
  TOKEN_EXPIRY_MINUTES: number;
}

const getEnvConfig = (): EnvConfig => {
  const {
    PORT,
    MONGO_URI,
    NODE_ENV,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    FRONTEND_URL,
    REDIS_URL,
    QUEUE_JOIN_COOLDOWN_SECONDS,
    QUEUE_JOIN_RATE_LIMIT_PER_MIN,
    QUEUE_JOIN_RATE_LIMIT_PER_HOUR,
  } = process.env;

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
    FRONTEND_URL: FRONTEND_URL || "http://localhost:3000",
    REDIS_URL: REDIS_URL || "redis://localhost:6379",
    // Rate limiting defaults
    QUEUE_JOIN_COOLDOWN_SECONDS: QUEUE_JOIN_COOLDOWN_SECONDS
      ? parseInt(QUEUE_JOIN_COOLDOWN_SECONDS, 10)
      : 120,
    QUEUE_JOIN_RATE_LIMIT_PER_MIN: QUEUE_JOIN_RATE_LIMIT_PER_MIN
      ? parseInt(QUEUE_JOIN_RATE_LIMIT_PER_MIN, 10)
      : 3,
    QUEUE_JOIN_RATE_LIMIT_PER_HOUR: QUEUE_JOIN_RATE_LIMIT_PER_HOUR
      ? parseInt(QUEUE_JOIN_RATE_LIMIT_PER_HOUR, 10)
      : 20,
    TOKEN_EXPIRY_MINUTES: process.env.TOKEN_EXPIRY_MINUTES
      ? parseInt(process.env.TOKEN_EXPIRY_MINUTES, 10)
      : 5,
  };
};

export const env = getEnvConfig();

