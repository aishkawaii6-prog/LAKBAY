import database from "../configs/database.js";
import bcrypt from "bcrypt";
import bookmarks_models from "./bookmarksModels.js";
import gallery_models from "./galleryModels.js";
import feedback_models from "./feedbackModels.js";
import activity_logs_models from "./activityLogsModels.js";
import activities_models from "./activitiesModels.js";
import notification_models from "./notificationModels.js";

const CATEGORY_MAP = {                                    // frontend → DB
  Waterfall: 'Waterfall', Beach: 'Beach', Park: 'Park',
  Heritage:  'Heritage',   Adventure: 'Adventure', Cave: 'Adventure',
  Other:     'Park',
};
const REVERSE_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])   // DB → frontend
);

const user_models = {

    // ── Internal helper: fire-and-forget activity log (never throws) ──
    logActivity: async ({ userId = null, action = '', entityType = '', entityId = null, description = '' }) => {
        try {
            await activity_logs_models.addActivityLog({
                user_id: userId, action,
                entity_type: entityType,
                entity_id: entityId,
                description,
            });
        } catch {
            // Silent — logging must never break the main workflow
        }
    },

    addUser: async (fullname, username, password) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const addUserQuery = "INSERT INTO users (fullname, username, password) VALUES (?,?,?)";
        const [result] = await database.execute(addUserQuery, [fullname, username, hashedPassword]);
        return result;
    },

    getUser: async () => {
        const getUserQuery = "SELECT * FROM users";
        const [rows] = await database.execute(getUserQuery);
        return rows;
    },

    editUser: async (fullname, username, password, id) => {
        // If password is provided, hash it and include in update
        // If password is undefined/null, keep existing password
        const setPasswordClause = password ? `, password = ?` : '';
        const query = `UPDATE users SET fullname = ?, username = ?${setPasswordClause} WHERE id = ?`;
        const params = password
            ? [fullname, username, password, id]
            : [fullname, username, id];
        const [result] = await database.execute(query, params);
        return result;
    },

    deleteUser: async (id) => {
        const deleteQuery = "DELETE FROM users WHERE id = ?";
        const [result] = await database.execute(deleteQuery, [id]);
        return result;
    },

    /* ── Destinations ── */
    dbToFrontendCategory: (dbCat) => REVERSE_MAP[dbCat] || dbCat,
    frontendToDbCategory: (feCat) => CATEGORY_MAP[feCat] || 'Park',

    getAllDestinations: async () => {
        const [rows] = await database.execute(
            `SELECT id, name, category, location, description, coverImage, images,
                    history, discovery, featured, mapUrl, latitude, longitude,
                    status, view_count, rating_average, created_at, updated_at
               FROM destinations WHERE status = 'active'
            ORDER BY featured DESC, created_at DESC`
        );
        return rows.map(r => ({
            id: String(r.id),
            name:    r.name,
            category: user_models.dbToFrontendCategory(r.category),
            location: r.location,
            description: r.description,
            coverImage: r.coverImage || '',
            images:     r.images ? JSON.parse(r.images) : [],
            history:    r.history    || '',
            discovery:  r.discovery  || '',
            featured:   !!r.featured,
            mapUrl:     r.mapUrl     || '',
            latitude:   r.latitude,
            longitude:  r.longitude,
            status:     r.status,
            view_count: r.view_count,
            rating_average: parseFloat(r.rating_average) || 0,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
        }));
    },

    getDestinationById: async (id) => {
        const [rows] = await database.execute(
            `SELECT * FROM destinations WHERE id = ?`, [id]
        );
        if (rows.length === 0) return null;
        const r = rows[0];
        return {
            id: String(r.id),
            name:    r.name,
            category: user_models.dbToFrontendCategory(r.category),
            location: r.location,
            description: r.description,
            coverImage: r.coverImage || '',
            images:     r.images ? JSON.parse(r.images) : [],
            history:    r.history    || '',
            discovery:  r.discovery  || '',
            featured:   !!r.featured,
            mapUrl:     r.mapUrl     || '',
            latitude:   r.latitude,
            longitude:  r.longitude,
            status:     r.status,
            view_count: r.view_count,
            rating_average: parseFloat(r.rating_average) || 0,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
        };
    },

    addDestination: async (data) => {
        const dbCat = user_models.frontendToDbCategory(data.category);
        const query =
            `INSERT INTO destinations
                 (name, category, location, description, coverImage, images,
                  history, discovery, featured, mapUrl, latitude, longitude, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const [result] = await database.execute(query, [
            data.name,
            dbCat,
            data.location,
            data.description,
            data.coverImage || '',
            data.images ? JSON.stringify(data.images) : null,
            data.history    || null,
            data.discovery  || null,
            data.featured   ? 1 : 0,
            data.mapUrl     || null,
            data.latitude   || null,
            data.longitude  || null,
            'active',
        ]);
        return result;
    },

    updateDestination: async (id, data) => {
        const dbCat = user_models.frontendToDbCategory(data.category);
        const query =
            `UPDATE destinations SET
                 name=?, category=?, location=?, description=?, coverImage=?,
                 images=?, history=?, discovery=?, featured=?, mapUrl=?,
                 latitude=?, longitude=?, status=?
             WHERE id=?`;
        const [result] = await database.execute(query, [
            data.name,
            dbCat,
            data.location,
            data.description,
            data.coverImage || '',
            data.images ? JSON.stringify(data.images) : null,
            data.history    || null,
            data.discovery  || null,
            data.featured   ? 1 : 0,
            data.mapUrl     || null,
            data.latitude   || null,
            data.longitude  || null,
            'active',
            id,
        ]);
        return result;
    },

    deleteDestination: async (id) => {
        const query = "DELETE FROM destinations WHERE id = ?";
        const [result] = await database.execute(query, [id]);
        return result;
    },

    /* ── Messages ── */
    sendMessage: async ({ name, email, subject, message, phone }) => {
        const [result] = await database.execute(
            `INSERT INTO messages (name, email, subject, message, phone, status)
             VALUES (?,?,?,?,?,'new')`,
            [name, email, subject || '', message, phone || '']
        );
        return result;
    },

    getMessages: async () => {
        const [rows] = await database.execute(
            `SELECT m.*, u.username
               FROM messages m
          LEFT JOIN users u ON m.user_id = u.id
           ORDER BY m.created_at DESC`
        );
        return rows.map(r => ({
            id:         r.id,
            name:       r.name,
            email:      r.email,
            subject:    r.subject,
            message:    r.message,
            phone:      r.phone,
            status:     r.status,
            readAt:     r.read_at,
            repliedAt:  r.replied_at,
            replyMessage: r.reply_message,
            userId:     r.user_id,
            createdAt:  r.created_at,
            updatedAt:  r.updated_at,
        }));
    },

    getMessageById: async (id) => {
        const [rows] = await database.execute(
            `SELECT * FROM messages WHERE id = ?`, [id]
        );
        return rows[0] || null;
    },

    updateMessage: async (id, { status, read_at, replied_at, reply_message }) => {
        const fields = [];
        const values = [];
        if (status !== undefined) { fields.push('status = ?'); values.push(status); }
        if (read_at  !== undefined) { fields.push('read_at = ?');  values.push(read_at); }
        if (replied_at  !== undefined) { fields.push('replied_at = ?');  values.push(replied_at); }
        if (reply_message !== undefined) { fields.push('reply_message = ?'); values.push(reply_message); }
        values.push(id);
        const query = `UPDATE messages SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await database.execute(query, values);
        return result;
    },

    deleteMessage: async (id) => {
        const query = "DELETE FROM messages WHERE id = ?";
        const [result] = await database.execute(query, [id]);
        return result;
    },

    getMessageStats: async () => {
        const [[total]]   = await database.execute("SELECT COUNT(*) AS total FROM messages");
        const [[unread]]  = await database.execute("SELECT COUNT(*) AS unread FROM messages WHERE status = 'new'");
        const [[today]]   = await database.execute("SELECT COUNT(*) AS today FROM messages WHERE DATE(created_at) = CURDATE()");
        const [[thisWeek]]= await database.execute("SELECT COUNT(*) AS thisWeek FROM messages WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)");
        return { total: total.total, unread: unread.unread, today: today.today, thisWeek: thisWeek.thisWeek };
    },

    /* ── News ── */
    getAllNews: async (filters = {}) => {
        let sql = `SELECT * FROM news WHERE published = 1`;
        const params = [];
        if (filters.featured) {
            sql += " AND featured = TRUE";
        }
        sql += " ORDER BY published_at DESC, created_at DESC";
        const [rows] = await database.execute(sql, params);
        return rows.map(r => ({
            id: String(r.id),
            title: r.title,
            content: r.content,
            summary: r.excerpt || '',
            image: r.coverImage || '',
            category: r.category,
            published: r.published === 1,
            publishedDate: r.published_at || r.created_at,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
        }));
    },

    getNews: async (filters = {}) => {
        let sql = `SELECT * FROM news`;
        const params = [];
        const conditions = [];
        if (filters.featured) {
            conditions.push("featured = TRUE");
        }
        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
        sql += " ORDER BY created_at DESC";
        const [rows] = await database.execute(sql, params);
        return rows.map(r => ({
            id: String(r.id),
            title: r.title,
            content: r.content,
            excerpt: r.excerpt || '',
            coverImage: r.coverImage || '',
            image: r.coverImage || '',
            category: r.category,
            featured: r.featured === 1,
            published: r.published === 1,
            published_at: r.published_at,
            _id: String(r.id),
        }));
    },

    getOneNews: async (id) => {
        const [rows] = await database.execute(
            `SELECT * FROM news WHERE id = ?`, [id]
        );
        if (rows.length === 0) return null;
        const r = rows[0];
        return {
            _id: String(r.id),
            id: String(r.id),
            title: r.title,
            content: r.content,
            summary: r.excerpt || '',
            image: r.coverImage || '',
            category: r.category,
            published: r.published === 1,
            publishedDate: r.published_at,
            createdAt: r.created_at,
        };
    },

    addNews: async (data) => {
        const [result] = await database.execute(
            `INSERT INTO news (title, content, excerpt, coverImage, category, featured, published, published_at, tags)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [data.title, data.content || '', data.excerpt || null, data.coverImage || null,
             data.category || 'news', data.featured ? 1 : 0, data.published ? 1 : 0, null, null]
        );
        return result;
    },

    updateNews: async (id, data) => {
        const [result] = await database.execute(
            `UPDATE news SET title=?, content=?, excerpt=?, coverImage=?, category=?, featured=?, published=?, published_at=? WHERE id=?`,
            [data.title, data.content || '', data.excerpt || null, data.coverImage || null,
             data.category || 'news', data.featured ? 1 : 0, data.published ? 1 : 0,
             data.published_at || null, id]
        );
        return result;
    },

    deleteNews: async (id) => {
        const query = "DELETE FROM news WHERE id = ?";
        const [result] = await database.execute(query, [id]);
        return result;
    },
    
    /* ── Gallery ── */
    getGalleryById: gallery_models.getGalleryById,
    
    /* ── Feedback ── */
    getFeedbackById: feedback_models.getFeedbackById,
    
    /* ── Bookmarks ── */
    getUserBookmarks: bookmarks_models.getUserBookmarks,
    isBookmarked: bookmarks_models.isBookmarked,
    addBookmark: bookmarks_models.addBookmark,
    removeBookmark: bookmarks_models.removeBookmark,
    getDestinationBookmarkCount: bookmarks_models.getDestinationBookmarkCount,
    
    /* ── Gallery ── */
    getAllGalleryImages: gallery_models.getAllGalleryImages,
    getGalleryByDestination: gallery_models.getGalleryByDestination,
    getFeaturedGalleryImages: gallery_models.getFeaturedGalleryImages,
    addGalleryImage: gallery_models.addGalleryImage,
    updateGalleryImage: gallery_models.updateGalleryImage,
    deleteGalleryImage: gallery_models.deleteGalleryImage,
    
    /* ── Feedback ── */
    getAllFeedback: feedback_models.getAllFeedback,
    getFeedbackByDestination: feedback_models.getFeedbackByDestination,
    getFeedbackCountByDestination: feedback_models.getFeedbackCountByDestination,
    getAverageRatingByDestination: feedback_models.getAverageRatingByDestination,
    addFeedback: feedback_models.addFeedback,
    updateFeedback: feedback_models.updateFeedback,
    deleteFeedback: feedback_models.deleteFeedback,
    incrementHelpfulCount: feedback_models.incrementHelpfulCount,
    
    /* ── Activity Logs ── */
    getActivityLogs: activity_logs_models.getActivityLogs,
    addActivityLog: activity_logs_models.addActivityLog,
    getActivityLogCount: activity_logs_models.getActivityLogCount,
    getRecentActivities: activity_logs_models.getRecentActivities,
    
    /* ── Activities ── */
    getAllActivities:         activities_models.getAllActivities,
    getActivityById:         activities_models.getActivityById,
    getActivitiesByCategory: activities_models.getActivitiesByCategory,
    addActivity:             activities_models.addActivity,
    updateActivity:          activities_models.updateActivity,
    deleteActivity:          activities_models.deleteActivity,
    /* ── Notifications ── */
    getAllNotifications:       notification_models.getAllNotifications,
    getOneNotification:        notification_models.getOneNotification,
    createNotification:        notification_models.createNotification,
    updateNotification:        notification_models.updateNotification,
    deleteNotification:        notification_models.deleteNotification,
    markAllNotificationsRead:  notification_models.markAllReadGlobal,
    getNotificationStats:      notification_models.getNotificationStats,
};

export default user_models;