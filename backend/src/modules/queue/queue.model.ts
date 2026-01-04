import mongoose, { Schema, Document, trusted } from 'mongoose';

////////////////////////-----------QUEUE ----------------
export interface IQueue extends Document {
  name: string;
  isActive: boolean;
  nextSequence: number;
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
  },
  { timestamps: true }
);

queueSchema.index({ name: 1 }, { unique: true });
queueSchema.index({ isActive: 1 });



//////-------------------------------------------------TOKEN ---------------------------------------------
///------------------------token statuses 
// Waiting - token is in queue
// Served - token has been called and served (completed : out from queue)
// Skipped - token was skipped (not served)
// Cancelled - token was cancelled by user
export enum TokenStatus {
  WAITING = "waiting",
  SERVED = "served",
  SKIPPED = "skipped",
  CANCELLED = "cancelled",
}

export interface IToken extends Document {
  queue: mongoose.Types.ObjectId;
  seq: number;
  status: TokenStatus;
  createdAt: Date;
  updatedAt: Date;
}
const tokenSchema = new Schema<IToken>(
  {
    queue: { // which queue this token belongs to
      type: Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },
    seq: {// sequence number within the queue
      type: Number,
      required: true,
    },
    status: { // life cycle status of the token
      type: String,
      enum: Object.values(TokenStatus),
      default: TokenStatus.WAITING,
    },
  },
  { timestamps: true }
);
tokenSchema.index({ queue:1, seq: 1 }, { unique: true });
tokenSchema.index({ queue: 1, status: 1 });

export const Token = mongoose.model<IToken>("Token", tokenSchema);
export const Queue = mongoose.model<IQueue>("Queue", queueSchema);
