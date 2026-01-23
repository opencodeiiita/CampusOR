import { Schema, model, Document, Types } from "mongoose";

export interface IAdminInvite extends Document {
  email: string;
  token: string; // Hashed token for security
  expiresAt: Date;
  createdBy: Types.ObjectId;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminInviteSchema = new Schema<IAdminInvite>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup and cleanup
adminInviteSchema.index({ email: 1 });
adminInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired invites? Maybe keep them for audit? 
// We can auto delete, but... maybe we want to see history. If we want auto-delete, we can uncomment.
// adminInviteSchema.index({ expiresAt: 1 }); 

export const AdminInvite = model<IAdminInvite>("AdminInvite", adminInviteSchema);
