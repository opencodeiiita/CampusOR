import { Token, TokenStatus } from "../modules/queue/token.model.js";
import { broadcastQueueUpdate } from "../server/socket.js";
import { setNowServing } from "../modules/queue/services/redisQueue.service.js";

// Check for expired tokens every 30 seconds
const EXPIRY_CHECK_INTERVAL_MS = 30 * 1000;

export const startTokenExpiryJob = () => {
    console.log("⏰ Starting Token Expiry Job...");

    setInterval(async () => {
        try {
            const now = new Date();

            // Find all tokens that are SERVED and have passed their expiry time
            const expiredTokens = await Token.find({
                status: TokenStatus.SERVED,
                expireAt: { $lt: now },
            });

            if (expiredTokens.length === 0) return;

            console.log(`⏰ Found ${expiredTokens.length} expired tokens. Processing...`);

            for (const token of expiredTokens) {
                // Update status to EXPIRED
                token.status = TokenStatus.EXPIRED;
                token.expireAt = undefined; // Clear expiry time
                await token.save();

                // Update Redis state (remove from Now Serving)
                await setNowServing(token.queue.toString(), null);

                // Broadcast update to frontend
                await broadcastQueueUpdate(token.queue.toString());

                console.log(`❌ Token ${token._id} (Seq: ${token.seq}) expired.`);
            }
        } catch (error) {
            console.error("Error in Token Expiry Job:", error);
        }
    }, EXPIRY_CHECK_INTERVAL_MS);
};
