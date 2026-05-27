import database from "../configs/database.js";

const gallery_models = {
    // Get all gallery images
    getAllGalleryImages: async () => {
        const [rows] = await database.execute(
            `SELECT g.*, d.name as destination_name
             FROM gallery g
             LEFT JOIN destinations d ON g.destination_id = d.id
             ORDER BY g.sort_order ASC, g.created_at DESC`
        );
        return rows;
    },

    // Get gallery images for a specific destination
    getGalleryByDestination: async (destinationId) => {
        const [rows] = await database.execute(
            `SELECT * FROM gallery 
             WHERE destination_id = ? AND is_featured = 1
             ORDER BY sort_order ASC, created_at DESC`,
            [destinationId]
        );
        return rows;
    },

    // Get gallery image by ID
    getGalleryById: async (id) => {
        const [rows] = await database.execute(
            `SELECT g.*, d.name as destination_name
             FROM gallery g
             LEFT JOIN destinations d ON g.destination_id = d.id
             WHERE g.id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    // Get featured gallery images
    getFeaturedGalleryImages: async (limit = 10) => {
        const [rows] = await database.execute(
            `SELECT g.*, d.name as destination_name
             FROM gallery g
             LEFT JOIN destinations d ON g.destination_id = d.id
             WHERE g.is_featured = 1
             ORDER BY g.sort_order ASC, g.created_at DESC
             LIMIT ?`,
            [limit]
        );
        return rows;
    },

    // Add a new gallery image
    addGalleryImage: async (data) => {
        const [result] = await database.execute(
            `INSERT INTO gallery 
             (destination_id, title, description, image_url, thumbnail_url, alt_text, sort_order, is_featured)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.destination_id || null,
                data.title || null,
                data.description || null,
                data.image_url,
                data.thumbnail_url || null,
                data.alt_text || null,
                data.sort_order || 0,
                data.is_featured ? 1 : 0
            ]
        );
        return result;
    },

    // Update a gallery image
    updateGalleryImage: async (id, data) => {
        const [result] = await database.execute(
            `UPDATE gallery SET
             destination_id = ?,
             title = ?,
             description = ?,
             image_url = ?,
             thumbnail_url = ?,
             alt_text = ?,
             sort_order = ?,
             is_featured = ?
             WHERE id = ?`,
            [
                data.destination_id || null,
                data.title || null,
                data.description || null,
                data.image_url,
                data.thumbnail_url || null,
                data.alt_text || null,
                data.sort_order || 0,
                data.is_featured ? 1 : 0,
                id
            ]
        );
        return result;
    },

    // Delete a gallery image
    deleteGalleryImage: async (id) => {
        const [result] = await database.execute(
            `DELETE FROM gallery WHERE id = ?`,
            [id]
        );
        return result;
    }
};

export default gallery_models;