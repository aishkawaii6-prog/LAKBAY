import database from "../configs/database.js";

const feedback_models = {
    // Get all feedback (admin view)
    getAllFeedback: async () => {
        const [rows] = await database.execute(
            `SELECT f.*, d.name as destination_name, d.category
             FROM feedback f
             JOIN destinations d ON f.spot_id = d.id
             ORDER BY f.created_at DESC`
        );
        return rows;
    },

    // Get feedback for a specific destination
    getFeedbackByDestination: async (destinationId) => {
        const [rows] = await database.execute(
            `SELECT f.*, u.username as user_name
             FROM feedback f
             LEFT JOIN users u ON f.user_id = u.id
             WHERE f.spot_id = ?
             ORDER BY f.created_at DESC`,
            [destinationId]
        );
        return rows;
    },

    // Get feedback count for a destination
    getFeedbackCountByDestination: async (destinationId) => {
        const [[row]] = await database.execute(
            `SELECT COUNT(*) as count FROM feedback WHERE spot_id = ?`,
            [destinationId]
        );
        return row.count;
    },

    // Get average rating for a destination
    getAverageRatingByDestination: async (destinationId) => {
        const [[row]] = await database.execute(
            `SELECT AVG(rating) as avg_rating FROM feedback WHERE spot_id = ?`,
            [destinationId]
        );
        return row.avg_rating || 0;
    },

    // Add new feedback
    addFeedback: async (data) => {
        const [result] = await database.execute(
            `INSERT INTO feedback 
             (spot_id, user_id, name, rating, comment, date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.spot_id,
                data.user_id || null,
                data.name,
                data.rating,
                data.comment || null,
                data.date
            ]
        );
        return result;
    },

    // Update feedback
    updateFeedback: async (id, data) => {
        const [result] = await database.execute(
            `UPDATE feedback SET
             spot_id = ?,
             user_id = ?,
             name = ?,
             rating = ?,
             comment = ?,
             date = ?
             WHERE id = ?`,
            [
                data.spot_id,
                data.user_id || null,
                data.name,
                data.rating,
                data.comment || null,
                data.date,
                id
            ]
        );
        return result;
    },

    // Delete feedback
    deleteFeedback: async (id) => {
        const [result] = await database.execute(
            `DELETE FROM feedback WHERE id = ?`,
            [id]
        );
        return result;
    },

    // Mark feedback as helpful
    incrementHelpfulCount: async (id) => {
        const [result] = await database.execute(
            `UPDATE feedback SET helpful_count = helpful_count + 1 WHERE id = ?`,
            [id]
        );
        return result;
    },

    // Recompute destinations.rating_average from all feedback for a given spot
    rateDestination: async (destinationId) => {
        const [[row]] = await database.execute(
            `SELECT ROUND(AVG(rating), 1) as avg_rating
             FROM feedback WHERE spot_id = ?`,
            [destinationId]
        );
        const avg = (row && row.avg_rating) || 0;
        await database.execute(
            `UPDATE destinations SET rating_average = ? WHERE id = ?`,
            [avg, destinationId]
        );
        return avg;
    },

    // Get per-destination rating stats (for home-page spot cards)
    getDestinationRatingStats: async () => {
        const [rows] = await database.execute(
            `SELECT d.id as destination_id,
                    ROUND(AVG(f.rating), 1) as avg_rating,
                    COUNT(f.id) as review_count
             FROM destinations d
             LEFT JOIN feedback f ON f.spot_id = d.id
             GROUP BY d.id`
        );
        return rows;
    }
};

export default feedback_models;