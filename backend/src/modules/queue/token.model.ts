import mongoose, { Schema, Document } from "mongoose";

//////-------------------------------------------------TOKEN ---------------------------------------------
///------------------------token statuses
// Waiting - token is in queue waiting to be served
// Served - token is currently being served at counter
// Completed - token service finished, user can leave
// Skipped - token was skipped (user not present)
// Cancelled - token was cancelled by user
export enum TokenStatus {
  WAITING = "waiting",
  SERVED = "served",
  COMPLETED = "completed",
  SKIPPED = "skipped",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export interface IToken extends Document {
  queue: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  seq: number;
  status: TokenStatus;
  expireAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const tokenSchema = new Schema<IToken>(
  {
    queue: {
      // which queue this token belongs to
      type: Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },
    userId: {
      // which queue this token belongs to
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seq: {
      // sequence number within the queue
      type: Number,
      required: true,
    },
    status: {
      // life cycle status of the token
      type: String,
      enum: Object.values(TokenStatus),
      default: TokenStatus.WAITING,
    },
    expireAt: {
      type: Date,
      index: true, // Efficient polling
    },
  },
  { timestamps: true }
);
tokenSchema.index({ queue: 1, seq: 1 }, { unique: true });
tokenSchema.index({ queue: 1, status: 1 });
tokenSchema.index({ userId: 1 }, {
  unique: true,
  partialFilterExpression: {
    status: TokenStatus.WAITING,
  }
});

export const Token = mongoose.model<IToken>("Token", tokenSchema);
