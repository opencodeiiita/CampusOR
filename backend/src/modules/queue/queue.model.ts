import mongoose, { Schema, Document } from "mongoose";

////////////////////////-----------QUEUE ----------------
export interface IQueue extends Document {
  name: string;
  location: string;
  isActive: boolean;
  nextSequence: number;
  capacity: number;
  isFull: boolean;
  tokenExpiryMinutes: number; // ✅ NEW
  operator?: mongoose.Types.ObjectId; // ✅ NEW
  createdAt: Date;
  updatedAt: Date;
}

const queueSchema = new Schema<IQueue>(
  {
    name: {
      type: String,
      required: true,
    },
    // [ADDED] Location field
    location: {
      type: String,
      required: true,
      trim: true,
    },
    // ✅ OPERATOR WHO CREATED THE QUEUE
    operator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // backward compatible
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    nextSequence: {
      type: Number,
      required: true,
      default: 1,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 50,
    },

    tokenExpiryMinutes: {
      type: Number,
      default: 5,
      min: 1,
    },

    isFull: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// [UPDATED] Unique index on name + location
queueSchema.index({ name: 1, location: 1 }, { unique: true });
queueSchema.index({ isActive: 1 });

export const Queue = mongoose.model<IQueue>("Queue", queueSchema);
