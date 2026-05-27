import database from "../configs/database.js";

const bookmarks_models = {
    // Get all bookmarks for a user
    getUserBookmarks: async (userId) => {
        const [rows] = await database.execute(
            `SELECT b.*, d.name as destination_name, d.category, d.location, d.coverImage
             FROM bookmarks b
             JOIN destinations d ON b.destination_id = d.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [userId]
        );
        return rows;
    },

    // Check if a destination is bookmarked by a user
    isBookmarked: async (userId, destinationId) => {
        const [rows] = await database.execute(
            `SELECT * FROM bookmarks WHERE user_id = ? AND destination_id = ?`,
            [userId, destinationId]
        );
        return rows.length > 0;
    },

    // Add a bookmark
    addBookmark: async (userId, destinationId, notes = '') => {
        const [result] = await database.execute(
            `INSERT INTO bookmarks (user_id, destination_id, notes)
             VALUES (?, ?, ?)`,
            [userId, destinationId, notes]
        );
        return result;
    },

    // Remove a bookmark
    removeBookmark: async (userId, destinationId) => {
        const [result] = await database.execute(
            `DELETE FROM bookmarks WHERE user_id = ? AND destination_id = ?`,
            [userId, destinationId]
        );
        return result;
    },

    // Get bookmark count for a destination
    getDestinationBookmarkCount: async (destinationId) => {
        const [[row]] = await database.execute(
            `SELECT COUNT(*) as count FROM bookmarks WHERE destination_id = ?`,
            [destinationId]
        );
        return row.count;
    }
};

export default bookmarks_models;