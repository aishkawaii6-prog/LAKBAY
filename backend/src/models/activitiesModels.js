import database from "../configs/database.js";

const activities_models = {
    // Get all activities
    getAllActivities: async () => {
        const [rows] = await database.execute(
            `SELECT * FROM activities ORDER BY event_date IS NULL ASC, event_date ASC, order_sequence ASC, name ASC`
        );
        return rows;
    },

    // Get activity by ID
    getActivityById: async (id) => {
        const [rows] = await database.execute(
            `SELECT * FROM activities WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    // Get activities by category
    getActivitiesByCategory: async (category) => {
        const [rows] = await database.execute(
            `SELECT * FROM activities WHERE category = ? AND is_active = 1 ORDER BY event_date IS NULL ASC, event_date ASC, order_sequence ASC, name ASC`,
            [category]
        );
        return rows;
    },

    // Add a new activity
    addActivity: async (data) => {
        const [result] = await database.execute(
            `INSERT INTO activities 
             (name, description, icon, category, order_sequence, is_active, event_date, event_time, location, event_image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.description || null,
                data.icon || null,
                data.category,
                data.order_sequence || 0,
                data.is_active !== false ? 1 : 0,
                data.event_date || null,
                data.event_time || null,
                data.location || null,
                data.event_image || null,
            ]
        );
        return result;
    },

    // Update an activity
    updateActivity: async (id, data) => {
        const [result] = await database.execute(
            `UPDATE activities SET
             name = ?,
             description = ?,
             icon = ?,
             category = ?,
             order_sequence = ?,
             is_active = ?,
             event_date = ?,
             event_time = ?,
             location = ?,
             event_image = ?
             WHERE id = ?`,
            [
                data.name,
                data.description || null,
                data.icon || null,
                data.category,
                data.order_sequence || 0,
                data.is_active !== false ? 1 : 0,
                data.event_date || null,
                data.event_time || null,
                data.location || null,
                data.event_image || null,
                id
            ]
        );
        return result;
    },

    // Delete an activity
    deleteActivity: async (id) => {
        const [result] = await database.execute(
            `DELETE FROM activities WHERE id = ?`,
            [id]
        );
        return result;
    }
};

export default activities_models;