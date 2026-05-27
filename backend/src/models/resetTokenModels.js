import database from '../configs/database.js';
import crypto from 'crypto';

//  TIMEZONE RULE
//  expires_at is stored using Date.getFullYear/getHours etc — which returns
//  the SERVER's LOCAL time (OS clock).  On a +08:00 server that equals NOW().
//  A UTC server environment would return getUTC* values via getFullYear etc.
//  Because we don't know the deployment clock, the safe pair is:
//    Stored  → expires_at via Date.getFullYear/getHours (OS clock)
//    Checked → NOW()   (same OS clock — no offset)
//  DO NOT mix expires_at  (local) with UTC_TIMESTAMP() (UTC clock).
const reset_token_models = {
    // Generate a new token for a user (expires in 15 min)
    createToken: async (userId) => {
        const token      = crypto.randomUUID();
        const expiresAt  = new Date(Date.now() + 15 * 60 * 1000);   // 15 min
        // Store using LOCAL date parts — matches whatever the server's OS clock reports
        const pad        = n => String(n).padStart(2, '0');
        const expiresAtDisplay =
            `${expiresAt.getFullYear()}-${pad(expiresAt.getMonth() + 1)}-${pad(expiresAt.getDate())} ` +
            `${pad(expiresAt.getHours())}:${pad(expiresAt.getMinutes())}:${pad(expiresAt.getSeconds())}`;
        const [result] = await database.execute(
            `INSERT INTO reset_tokens (user_id, token, expires_at)
             VALUES (?, ?, ?)`,
            [userId, token, expiresAtDisplay]
        );
        return { token, expiresAt: expiresAtDisplay };
    },

    // Verify token — NOW() matches the same OS clock used in createToken local fields
    verifyToken: async (token) => {
        const [rows] = await database.execute(
            `SELECT * FROM reset_tokens
             WHERE token = ? AND used = 0 AND expires_at > NOW()`,
            [token]
        );
        return rows[0] || null;
    },

    // Mark token as used
    markUsed: async (token) => {
        const [result] = await database.execute(
            `UPDATE reset_tokens SET used = 1 WHERE token = ?`,
            [token]
        );
        return result;
    },

    // Mark all tokens for a user as used (invalidate all)
    invalidateAllTokens: async (userId) => {
        const [result] = await database.execute(
            `UPDATE reset_tokens SET used = 1 WHERE user_id = ? AND used = 0`,
            [userId]
        );
        return result;
    },

    // Cleanup — uses NOW() to match Node's get* local fields
    cleanupExpired: async () => {
        const [result] = await database.execute(
            `DELETE FROM reset_tokens WHERE expires_at < NOW() OR used = 1`
        );
        return result;
    }
};

export default reset_token_models;
