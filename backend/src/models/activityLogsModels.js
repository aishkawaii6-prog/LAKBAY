import database from "../configs/database.js";

const activity_logs_models = {
    // Get activity logs with optional filtering
    getActivityLogs: async (filters = {}) => {
        let query = `
            SELECT al.*, u.username as user_name, u.fullname as user_fullname
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
        `;
        const params = [];
        const conditions = [];

        if (filters.user_id) {
            conditions.push("al.user_id = ?");
            params.push(filters.user_id);
        }

        if (filters.action) {
            conditions.push("al.action = ?");
            params.push(filters.action);
        }

        if (filters.entity_type) {
            conditions.push("al.entity_type = ?");
            params.push(filters.entity_type);
        }

        if (filters.entity_id) {
            conditions.push("al.entity_id = ?");
            params.push(filters.entity_id);
        }

        if (filters.start_date) {
            conditions.push("DATE(al.created_at) >= ?");
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            conditions.push("DATE(al.created_at) <= ?");
            params.push(filters.end_date);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY al.created_at DESC";

        if (filters.limit) {
            query += " LIMIT ?";
            params.push(parseInt(filters.limit));
        }

        const [rows] = await database.execute(query, params);
        return rows;
    },

    // Add a new activity log entry
    addActivityLog: async (data) => {
        const [result] = await database.execute(
            `INSERT INTO activity_logs 
             (user_id, action, entity_type, entity_id, description, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.user_id || null,
                data.action,
                data.entity_type || null,
                data.entity_id || null,
                data.description || null,
                data.ip_address || null,
                data.user_agent || null
            ]
        );
        return result;
    },

    // Get activity log count
    getActivityLogCount: async (filters = {}) => {
        let query = "SELECT COUNT(*) as count FROM activity_logs al";
        const params = [];
        const conditions = [];

        if (filters.user_id) {
            conditions.push("al.user_id = ?");
            params.push(filters.user_id);
        }

        if (filters.action) {
            conditions.push("al.action = ?");
            params.push(filters.action);
        }

        if (filters.entity_type) {
            conditions.push("al.entity_type = ?");
            params.push(filters.entity_type);
        }

        if (filters.entity_id) {
            conditions.push("al.entity_id = ?");
            params.push(filters.entity_id);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        const [[row]] = await database.execute(query, params);
        return row.count;
    },

    // Get recent activities for dashboard
    getRecentActivities: async (limit = 10) => {
        const [rows] = await database.execute(
            `SELECT al.*, u.username as user_name, u.fullname as user_fullname
             FROM activity_logs al
             LEFT JOIN users u ON al.user_id = u.id
             ORDER BY al.created_at DESC
             LIMIT ?`,
            [limit]
        );
        return rows;
    }
};

export default activity_logs_models;