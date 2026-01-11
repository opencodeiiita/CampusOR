import { Schema, model, Document, Types } from "mongoose";

export type UserRole = "user" | "operator" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  // Role-specific fields
  collegeEmail?: string; // Required for "user" role
  department?: string; // Required for "operator" role
  position?: string; // Required for "operator" role

  // Queue-related fields
  currentQueue?: Types.ObjectId; // Reference to queue if user is in queue
  isInQueue?: boolean; // Flag to indicate if user is currently in queue
  pastQueues?: Types.ObjectId[]; // Reference to queues if user has been in queue

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "operator", "admin"],
      default: "user", //by default role : user
    },
    // Role-specific fields (optional in schema, validated in service)
    collegeEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },

    // Queue-related fields
    currentQueue: {
      type: Schema.Types.ObjectId,
      ref: "Queue",
      required: false,
    },
    isInQueue: {
      type: Boolean,
      default: false,
    },
    pastQueues: [{
      type: Schema.Types.ObjectId,
      ref: "Queue",
    }],
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
