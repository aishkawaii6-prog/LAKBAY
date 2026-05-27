import database from "../configs/database.js";

const notification_models = {
    getAllNotifications: async (filters = {}) => {
        let sql = `SELECT * FROM notifications`;
        const params = [];
        const conditions = [];

        if (filters.user_id) {
            conditions.push("user_id = ?");
            params.push(filters.user_id);
        }
        if (typeof filters.is_read === 'boolean') {
            conditions.push("is_read = ?");
            params.push(filters.is_read ? 1 : 0);
        }
        if (filters.type) {
            conditions.push("type = ?");
            params.push(filters.type);
        }
        if (typeof filters.unread_only === 'boolean' && filters.unread_only) {
            conditions.push("is_read = 0");
        }

        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
        sql += " ORDER BY created_at DESC";
        if (filters.limit) {
            sql += " LIMIT " + parseInt(filters.limit);
        }

        const [rows] = await database.execute(sql, params);
        return rows.map(r => ({
            id:         String(r.id),
            userId:     r.user_id ? String(r.user_id) : null,
            icon:       r.icon,
            title:      r.title,
            message:    r.message,
            type:       r.type,
            badge:      r.badge,
            badgeColor: r.badge_color,
            priority:   r.priority,
            isRead:     r.is_read === 1,
            createdAt:  r.created_at,
            updatedAt:  r.updated_at,
        }));
    },

    getOneNotification: async (id) => {
        const [rows] = await database.execute(
            `SELECT * FROM notifications WHERE id = ?`, [id]
        );
        if (rows.length === 0) return null;
        const r = rows[0];
        return {
            id:         String(r.id),
            userId:     r.user_id ? String(r.user_id) : null,
            icon:       r.icon,
            title:      r.title,
            message:    r.message,
            type:       r.type,
            badge:      r.badge,
            badgeColor: r.badge_color,
            priority:   r.priority,
            isRead:     r.is_read === 1,
            createdAt:  r.created_at,
            updatedAt:  r.updated_at,
        };
    },

    createNotification: async (data) => {
        const [result] = await database.execute(
            `INSERT INTO notifications
                 (user_id, icon, title, message, type, badge, badge_color, priority, is_read)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [
                data.user_id || null,
                data.icon || '🔔',
                data.title,
                data.message,
                data.type || 'system',
                data.badge || null,
                data.badge_color || null,
                data.priority || 'normal',
                data.is_read ? 1 : 0,
            ]
        );
        return result;
    },

    updateNotification: async (id, data) => {
        const sets = [];
        const params = [];

        const fieldMap = {
            title:     'title = ?',
            message:   'message = ?',
            type:      'type = ?',
            icon:      'icon = ?',
            badge:     'badge = ?',
            badge_color: 'badge_color = ?',
            priority:  'priority = ?',
            is_read:   'is_read = ?',
            user_id:   'user_id = ?',
        };

        for (const [key, col] of Object.entries(fieldMap)) {
            if (data[key] !== undefined) {
                sets.push(col);
                // For booleans store as int
                const val = ['is_read'].includes(key)
                    ? (data[key] ? 1 : 0)
                    : data[key];
                params.push(val === null || val === undefined ? null : val);
            }
        }

        if (!sets.length) {
            throw new Error('No fields to update');
        }

        const sql = `UPDATE notifications SET ${sets.join(', ')} WHERE id = ?`;
        params.push(id);
        const [result] = await database.execute(sql, params);
        return result;
    },

    markAllRead: async (userId) => {
        const [result] = await database.execute(
            `UPDATE notifications
                 SET is_read = 1
               WHERE user_id = ? AND is_read = 0`,
            [userId]
        );
        return result;
    },

    markAllReadGlobal: async () => {
        const [result] = await database.execute(
            `UPDATE notifications SET is_read = 1 WHERE is_read = 0`
        );
        return result;
    },

    deleteNotification: async (id) => {
        const [result] = await database.execute(
            `DELETE FROM notifications WHERE id = ?`, [id]
        );
        return result;
    },

    getUnreadCount: async (userId) => {
        const sql = userId
            ? `SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0`
            : `SELECT COUNT(*) AS cnt FROM notifications WHERE is_read = 0`;
        const [[row]] = await database.execute(sql, userId ? [userId] : []);
        return row.cnt || 0;
    },

    getNotificationStats: async (userId) => {
        const sqlTotal = userId
            ? `SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?`
            : `SELECT COUNT(*) AS total FROM notifications`;
        const [[totalRow]] = await database.execute(sqlTotal, userId ? [userId] : []);

        const sqlUnread = userId
            ? `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`
            : `SELECT COUNT(*) AS unread FROM notifications WHERE is_read = 0`;
        const [[unreadRow]] = await database.execute(sqlUnread, userId ? [userId] : []);

        const [[typeRows]] = await database.execute(
            `SELECT type, COUNT(*) AS cnt FROM notifications GROUP BY type`
        );
        const byType = {};
        if (Array.isArray(typeRows)) {
            typeRows.forEach(r => { byType[r.type] = r.cnt; });
        }

        return {
            total:  (totalRow  || {}).total  || 0,
            unread: (unreadRow || {}).unread || 0,
            byType,
        };
    },
};

export default notification_models;
