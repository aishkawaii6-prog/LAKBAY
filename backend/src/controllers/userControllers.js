import user_models from "../models/userModels.js";
import reset_token_models from "../models/resetTokenModels.js";
import validators from "../validators/validators.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import database from "../configs/database.js";

// OBJECT FUNCTION LITERAL
const user_controllers = {
    insert: async (request, response) => {
        try {
            const { fullname, username, password } = request.body;

            const usernameExist = await validators.usernameExist(username);

            if (usernameExist.length > 0) {
                response.status(409).json({ message: "Username already exist!" });
                return;
            }

            const result = await user_models.addUser(fullname, username, password);

            if (result && result.affectedRows === 1) {
                response.status(201).json({ message: "Account created!" });
                user_models.logActivity({ action: 'create', entityType: 'user', description: `Created user account: ${username}` }).catch(() => {});
                return;
            }
            response.status(500).json({ message: "Failed to create account. Please try again." });
        } 
        catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });    
        }
    },

    get: async (_request, response) => {
        try {
            const result = await user_models.getUser();

             if (result || result.length > 0) {
                response.status(201).json({ data: result });   
                return;
            }
        } 
        catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });    
        }
    },

     edit: async (request, response) => {
         try {
             const token = request.headers.authorization?.split(' ')[1];
             if (!token) return response.status(401).json({ message: "No token provided" });

             const decoded = jwt.verify(token, process.env.JWT_SECRET);

             const { fullname, username, email, password } = request.body;

             // Only hash and update password if a new one was provided
             const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

             const result = await user_models.editUser(fullname, username, hashedPassword, decoded.id);

             // Also update email in the users table directly
             if (email !== undefined) {
                 const [emailResult] = await database.execute(
                     "UPDATE users SET email = ? WHERE id = ?",
                     [email, decoded.id]
                 );
                 console.log(emailResult);
             }

             console.log(result);

             if (result.affectedRows === 1) {
                 response.status(200).json({ message: "Profile updated successfully" });
             } else {
                 response.status(404).json({ message: "User does not exist" });
             }
         }
         catch (error) {
             response.status(500).json({ message: `Error: ${error.message}` });    
         }
     },

    delete: async (request, response) => {
        try {
            const id = request.params.id;

            const result = await user_models.deleteUser(id);

            console.log(result);

            if (result.affectedRows === 1) {
                response.status(201).json({ message: "Delete successfully" });
            }
            else {
                response.status(409).json({ message: "User does not exist" });
            }
        }
        catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    // Auth methods
    login: async (request, response) => {
        try {
            const { email, password } = request.body;

            // For now, use username as email
            const users = await user_models.getUser();
            const user = users.find(u => u.username === email);

            if (!user) {
                return response.status(401).json({ message: "Invalid credentials" });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return response.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: 'user' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            user_models.logActivity({ userId: user.id, action: 'login', entityType: 'user', description: `User logged in: ${user.username}` }).catch(() => {});

            response.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    role: 'user'
                }
            });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    adminLogin: async (request, response) => {
        try {
            const { email, password } = request.body;

            // Fetch all users and find the admin by username OR email
            const users = await user_models.getUser();
            const adminUser = users.find(u =>
                (u.username === 'admin' && u.role === 'admin') ||
                (u.email && u.email.toLowerCase() === String(email).toLowerCase() && u.role === 'admin')
            );

            if (!adminUser) {
                return response.status(401).json({ message: "Admin account not found in database" });
            }

            // Verify password — guard bcrypt.compare so a bad hash never throws
            let isValidPassword = false;
            try {
                isValidPassword = await bcrypt.compare(password, adminUser.password);
            } catch { /* bad hash or type mismatch */ }
            if (!isValidPassword) {
                return response.status(401).json({ message: "Invalid admin credentials" });
            }

            const token = jwt.sign(
                { id: adminUser.id, username: adminUser.username, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            user_models.logActivity({ userId: adminUser.id, action: 'admin_login', entityType: 'user', description: `Admin logged in: ${adminUser.username}` }).catch(() => {});

            response.json({
                token,
                user: {
                    id: adminUser.id,
                    username: adminUser.username,
                    fullname: adminUser.fullname,
                    role: 'admin'
                }
            });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getProfile: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: "No token provided" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users = await user_models.getUser();
            const user = users.find(u => u.id === decoded.id);

            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            response.json({
                user: {
                    id: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email || '',
                    role: decoded.role
                }
            });
        } catch (error) {
            response.status(401).json({ message: "Invalid token" });
        }
    },

    // ── Forgot Password ──
    forgotPassword: async (request, response) => {
        try {
            const { email } = request.body;

            // ONLY accept the hardcoded admin email
            const ADMIN_EMAIL = 'admin@lakbay.com';
            if (!email || email.trim().toLowerCase() !== ADMIN_EMAIL) {
                return response.status(404).json({
                    message: 'No admin account found with this email address.'
                });
            }

            const users = await user_models.getUser();
            const adminUser = users.find(u => u.username === 'admin' && u.role === 'admin');

            if (!adminUser) {
                return response.status(404).json({ message: 'Admin account not found.' });
            }

            // Invalidate all previous tokens
            await reset_token_models.invalidateAllTokens(adminUser.id);

            // Create new token (returns { token: <uuid>, expiresAt: <date> })
            const { token: resetToken, expiresAt: exp } = await reset_token_models.createToken(adminUser.id);

            // Generate a short 6-digit OTP to display on-screen
            // In production the actual resetToken UUID is delivered via email
            const shortCode = String(Math.floor(100000 + Math.random() * 900000));

            // Log the password-reset request
            user_models.logActivity({
                userId: adminUser.id,
                action: 'forgot_password',
                entityType: 'user',
                description: `Password reset requested for admin account`
            }).catch(() => {});

            response.json({
                message: 'A verification token has been generated. Please check the screen.',
                // shortCode is only for the on-screen demo display
                // In production, send resetToken via email instead
                shortCode,
                // The actual token that the verify step must submit
                resetToken,
                userId: adminUser.id
            });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    verifyResetToken: async (request, response) => {
        try {
            const { token, email } = request.body;

            const ADMIN_EMAIL = 'admin@lakbay.com';
            if (!email || !token) {
                return response.status(400).json({ message: 'Email and verification token are required.' });
            }
            if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
                // Always generic error for security
                return response.status(400).json({ message: 'Invalid verification data.' });
            }
            if (!String(token).trim()) {
                return response.status(400).json({ message: 'Verification token cannot be empty.' });
            }

            const valid = await reset_token_models.verifyToken(token.trim());
            if (!valid) {
                return response.status(401).json({
                    message: 'Invalid or expired verification token. Please try again.'
                });
            }

            response.json({
                message: 'Token verified successfully. You can now reset your password.',
                userId: valid.user_id
            });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    // ── Reset Password (after OTP / token verified) ──
    resetPassword: async (request, response) => {
        try {
            const { userId, newPassword, confirmPassword } = request.body;

            if (!userId || !newPassword || !confirmPassword) {
                return response.status(400).json({ message: 'All password fields are required.' });
            }
            if (newPassword !== confirmPassword) {
                return response.status(400).json({ message: 'Passwords do not match.' });
            }
            if (newPassword.length < 6) {
                return response.status(400).json({ message: 'Password must be at least 6 characters.' });
            }

            const users = await user_models.getUser();
            const user = users.find(u => u.id === userId);
            if (!user) {
                return response.status(404).json({ message: 'User not found.' });
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            const result = await user_models.editUser(user.fullname, user.username, hashed, userId);

            if (result.affectedRows === 1) {
                // Invalidate all used tokens
                await reset_token_models.invalidateAllTokens(userId).catch(() => {});

                user_models.logActivity({
                    userId: user.id,
                    action: 'reset_password',
                    entityType: 'user',
                    description: `Password was reset via Forgot Password flow`
                }).catch(() => {});

                response.json({ message: 'Password reset successful. You may now log in.' });
            } else {
                response.status(500).json({ message: 'Failed to reset password.' });
            }
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    // ── Change Password (logged-in user) ──
    changePassword: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            const { currentPassword, newPassword } = request.body;

            if (!token) {
                return response.status(401).json({ message: "No token provided" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users = await user_models.getUser();
            const user = users.find(u => u.id === decoded.id);

            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return response.status(400).json({ message: "Current password is incorrect" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await user_models.editUser(user.fullname, user.username, hashedPassword, user.id);

            user_models.logActivity({ userId: user.id, action: 'change_password', entityType: 'user', description: `Password changed for: ${user.username}` }).catch(() => {});

            response.json({ message: "Password changed successfully" });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    logout: async (request, response) => {
        // Decode token to get user id for log
        let uid = null;
        try {
            const t = request.headers.authorization?.split(' ')[1];
            if (t) {
                const d = jwt.verify(t, process.env.JWT_SECRET);
                uid = d.id;
            }
            user_models.logActivity({ userId: uid, action: 'logout', entityType: 'user', description: `User logged out` }).catch(() => {});
        } catch { /* never break the logout */ }
        // For stateless JWT, logout is handled on client side
        response.json({ message: "Logged out successfully" });
    },

    // Messages methods
    sendMessage: async (request, response) => {
        try {
            const { name, email, subject, message, phone } = request.body;

            // Require core fields
            if (!name || !email || !message) {
                return response.status(400).json({ message: 'Name, email, and message are required.' });
            }

            const result = await user_models.sendMessage({
                name: name.trim(),
                email: email.trim(),
                subject: subject ? subject.trim() : '',
                message: message.trim(),
                phone: phone ? phone.trim() : '',
            });

            // Fetch the inserted row
            const inserted = await user_models.getMessageById(result.insertId);
            user_models.logActivity({
                action: 'create', entityType: 'message',
                description: `New contact message submitted by ${name} (${email})`
            }).catch(() => {});
            response.status(201).json({
                message: 'Message sent successfully',
                data: inserted || result,
            });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getMessages: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }

            const rows = await user_models.getMessages();
            response.json({ messages: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    updateMessage: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }

            const { id } = request.params;
            const { status, read_at, replied_at, reply_message } = request.body;

            const result = await user_models.updateMessage(id, {
                status, read_at, replied_at, reply_message,
            });

            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Message not found' });
            }

            user_models.logActivity({
                userId: decoded.id, action: 'update', entityType: 'message',
                description: `Updated message ID ${id}: status=${status || 'unchanged'}`
            }).catch(() => {});
            const updated = await user_models.getMessageById(id);
            response.json({ message: 'Message updated successfully', data: updated });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    deleteMessage: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }

            const { id } = request.params;
            const result = await user_models.deleteMessage(id);

            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Message not found' });
            }

            user_models.logActivity({
                userId: decoded.id, action: 'delete', entityType: 'message',
                description: `Deleted message ID ${id}`
            }).catch(() => {});
            response.json({ message: 'Message deleted successfully' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getMessageStats: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }

            const stats = await user_models.getMessageStats();
            response.json(stats);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    // ── Destinations controller ──
    getAllDestinations: async (_request, response) => {
        try {
            const rows = await user_models.getAllDestinations();
            response.json({ destinations: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getOneDestination: async (request, response) => {
        try {
            const row = await user_models.getDestinationById(request.params.id);
            if (!row) return response.status(404).json({ message: 'Destination not found' });
            response.json(row);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    addDestination: async (request, response) => {
        try {
            const data = request.body;
            const result = await user_models.addDestination(data);
            const newId  = String(result.insertId);
            // Sync gallery images into the gallery table
            const images = Array.isArray(data.images) ? data.images
                     : Array.isArray(data.galleryImages) ? data.galleryImages
                     : [];
            if (images.length) {
                for (const url of images) {
                    if (url) await user_models.addGalleryImage({ image_url: url, destination_id: newId });
                }
            }
            const newRow = await user_models.getDestinationById(newId);
            response.status(201).json(newRow);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    updateDestination: async (request, response) => {
        try {
            const { id } = request.params;
            const data   = request.body;
            const result = await user_models.updateDestination(id, data);
            if (result.affectedRows === 0)
                return response.status(404).json({ message: 'Destination not found' });
            // Sync new gallery images (only add — never delete existing ones via update)
            const images = Array.isArray(data.images) ? data.images
                     : Array.isArray(data.galleryImages) ? data.galleryImages
                     : [];
            const existingUrls = new Set(
                (await user_models.getGalleryByDestination(id))
                    .map(g => g.image_url)
            );
            for (const url of images) {
                if (url && !existingUrls.has(url)) {
                    await user_models.addGalleryImage({ image_url: url, destination_id: String(id) });
                }
            }
            const updated = await user_models.getDestinationById(id);
            response.json(updated);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    deleteDestination: async (request, response) => {
        try {
            const { id } = request.params;
            // Remove all gallery rows before deleting the destination
            const existing = await user_models.getGalleryByDestination(id).catch(() => []);
            for (const g of existing) {
                await user_models.deleteGalleryImage(g.id);
            }
            const result = await user_models.deleteDestination(id);
            if (result.affectedRows === 0)
                return response.status(404).json({ message: 'Destination not found' });
            response.status(200).json({ message: 'Destination deleted' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    // Static data methods
    getDestinations: async (request, response) => {
        try {
            const rows = await user_models.getAllDestinations();
            response.json({ destinations: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getNews: async (request, response) => {
        try {
            const filters = {};
            if (request.query.featured === 'true') filters.featured = true;
            const rows = await user_models.getNews(filters);
            response.json({ news: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getAllNews: async (request, response) => {
        try {
            const filters = {};
            if (request.query.featured === 'true') filters.featured = true;
            const rows = await user_models.getAllNews(filters);
            response.json({ news: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getOneNews: async (request, response) => {
        try {
            const row = await user_models.getOneNews(request.params.id);
            if (!row) return response.status(404).json({ message: 'News not found' });
            response.json(row);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    addNews: async (request, response) => {
        try {
            const data = request.body;
            const result = await user_models.addNews(data);
            const newRow = await user_models.getOneNews(result.insertId);
            user_models.logActivity({
                action: 'create', entityType: 'news',
                description: `Created news: "${data.title || 'Untitled'}"`
            }).catch(() => {});
            response.status(201).json(newRow);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    updateNews: async (request, response) => {
        try {
            const { id } = request.params;
            const data = request.body;
            const result = await user_models.updateNews(id, data);
            if (result.affectedRows === 0)
                return response.status(404).json({ message: 'News not found' });
            user_models.logActivity({
                action: 'update', entityType: 'news',
                description: `Updated news ID ${id}: "${data.title || 'Untitled'}"`
            }).catch(() => {});
            const updated = await user_models.getOneNews(id);
            response.json(updated);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    deleteNews: async (request, response) => {
        try {
            const { id } = request.params;
            const result = await user_models.deleteNews(id);
            if (result.affectedRows === 0)
                return response.status(404).json({ message: 'News not found' });
            response.status(200).json({ message: 'News deleted' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    // ── Bookmarks Controller ──
    getUserBookmarks: async (request, response) => {
        try {
            const { userId } = request.params;
            const rows = await user_models.getUserBookmarks(userId);
            response.json({ bookmarks: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    isBookmarked: async (request, response) => {
        try {
            const { userId, destinationId } = request.params;
            const isMarked = await user_models.isBookmarked(userId, destinationId);
            response.json({ bookmarked: isMarked });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    addBookmark: async (request, response) => {
        try {
            const { userId, destinationId, notes } = request.body;
            if (!userId || !destinationId) {
                return response.status(400).json({ message: 'User ID and Destination ID are required' });
            }
            const result = await user_models.addBookmark(userId, destinationId, notes);
            user_models.logActivity({
                userId, action: 'create', entityType: 'bookmark',
                description: `User ${userId} bookmarked destination ID ${destinationId}`
            }).catch(() => {});
            response.status(201).json({ message: 'Bookmark added successfully', bookmarkId: result.insertId });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    removeBookmark: async (request, response) => {
        try {
            const { userId, destinationId } = request.params;
            if (!userId || !destinationId) {
                return response.status(400).json({ message: 'User ID and Destination ID are required' });
            }
            const result = await user_models.removeBookmark(userId, destinationId);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Bookmark not found' });
            }
            user_models.logActivity({
                userId, action: 'delete', entityType: 'bookmark',
                description: `User ${userId} removed bookmark for destination ID ${destinationId}`
            }).catch(() => {});
            response.json({ message: 'Bookmark removed successfully' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getDestinationBookmarkCount: async (request, response) => {
        try {
            const { destinationId } = request.params;
            const count = await user_models.getDestinationBookmarkCount(destinationId);
            response.json({ count });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    // ── Gallery Controller ──
    getAllGalleryImages: async (request, response) => {
        try {
            const rows = await user_models.getAllGalleryImages();
            response.json({ gallery: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getGalleryByDestination: async (request, response) => {
        try {
            const { destinationId } = request.params;
            const rows = await user_models.getGalleryByDestination(destinationId);
            response.json({ gallery: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getFeaturedGalleryImages: async (request, response) => {
        try {
            const limit = parseInt(request.query.limit) || 10;
            const rows = await user_models.getFeaturedGalleryImages(limit);
            response.json({ gallery: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    addGalleryImage: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }
            const data = request.body;
            if (!data.image_url) {
                return response.status(400).json({ message: 'Image URL is required' });
            }
            const result = await user_models.addGalleryImage(data);
            const newImage = await user_models.getGalleryById(result.insertId);
            user_models.logActivity({
                action: 'create', entityType: 'gallery',
                description: `Added gallery image for destination: ${data.destination_id || 'none'}`
            }).catch(() => {});
            response.status(201).json(newImage);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    updateGalleryImage: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }
            const { id } = request.params;
            const data = request.body;
            const result = await user_models.updateGalleryImage(id, data);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Gallery image not found' });
            }
            user_models.logActivity({
                action: 'update', entityType: 'gallery',
                description: `Updated gallery image ID ${id}`
            }).catch(() => {});
            const updated = await user_models.getGalleryById(id);
            response.json(updated);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    deleteGalleryImage: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }
            const { id } = request.params;
            const result = await user_models.deleteGalleryImage(id);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Gallery image not found' });
            }
            user_models.logActivity({
                action: 'delete', entityType: 'gallery',
                description: `Deleted gallery image ID ${id}`
            }).catch(() => {});
            response.json({ message: 'Gallery image deleted successfully' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getGalleryById: async (request, response) => {
        try {
            const { id } = request.params;
            const gallery = await user_models.getGalleryById(id);
            if (!gallery) {
                return response.status(404).json({ message: 'Gallery image not found' });
            }
            response.json(gallery);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getFeedbackById: async (request, response) => {
        try {
            const { id } = request.params;
            const feedback = await user_models.getFeedbackById(id);
            if (!feedback) {
                return response.status(404).json({ message: 'Feedback not found' });
            }
            response.json(feedback);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    // ── Feedback Controller ──
    getAllFeedback: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }
            
            const rows = await user_models.getAllFeedback();
            response.json({ feedback: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getFeedbackByDestination: async (request, response) => {
        try {
            const { destinationId } = request.params;
            const rows = await user_models.getFeedbackByDestination(destinationId);
            response.json({ feedback: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getFeedbackCountByDestination: async (request, response) => {
        try {
            const { destinationId } = request.params;
            const count = await user_models.getFeedbackCountByDestination(destinationId);
            response.json({ count });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getAverageRatingByDestination: async (request, response) => {
        try {
            const { destinationId } = request.params;
            const avgRating = await user_models.getAverageRatingByDestination(destinationId);
            response.json({ averageRating: parseFloat(avgRating) || 0 });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    addFeedback: async (request, response) => {
        try {
            const data = request.body;
            if (!data.spot_id || !data.name || !data.rating || !data.date) {
                return response.status(400).json({ 
                    message: 'Spot ID, name, rating, and date are required' 
                });
            }
            
            // Validate rating is between 1-5
            if (data.rating < 1 || data.rating > 5) {
                return response.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            
            const result = await user_models.addFeedback(data);
            const newFeedback = await user_models.getFeedbackById(result.insertId);
            user_models.logActivity({
                action: 'create', entityType: 'feedback',
                description: `New review added: ${data.name} rated spot ${data.spot_id} — ${data.rating}★`
            }).catch(() => {});
            response.status(201).json(newFeedback);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    updateFeedback: async (request, response) => {
        try {
            const { id } = request.params;
            const data = request.body;
            
            // Validate rating if provided
            if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
                return response.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            
            const result = await user_models.updateFeedback(id, data);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Feedback not found' });
            }
            const updated = await user_models.getFeedbackById(id);
            user_models.logActivity({
                action: 'update', entityType: 'feedback',
                description: `Updated feedback ID ${id}`
            }).catch(() => {});
            response.json(updated);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

     deleteFeedback: async (request, response) => {
         try {
             const { id } = request.params;
             const result = await user_models.deleteFeedback(id);
             if (result.affectedRows === 0) {
                 return response.status(404).json({ message: 'Feedback not found' });
             }
             user_models.logActivity({
                 action: 'delete', entityType: 'feedback',
                 description: `Deleted feedback/review ID ${id}`
             }).catch(() => {});
             response.status(200).json({ message: 'Feedback deleted successfully' });
         } catch (error) {
             response.status(500).json({ message: `Error: ${error.message}` });
         }
     },

    // ── Rate Destination Controller ──
    rateDestination: async (request, response) => {
        try {
            const { id } = request.params;
            const { rating } = request.body;

            // Insert a new feedback entry then recompute the average rating
            if (!rating || rating < 1 || rating > 5) {
                return response.status(400).json({ message: 'Rating must be between 1 and 5' });
            }

            // Feedback is recorded at the SpotModal level via POST /api/feedback
            // This endpoint advances the destination's cached rating_average
            const avg = await user_models.rateDestination(id);

            user_models.logActivity({
                action: 'update', entityType: 'destination',
                description: `Destination ID ${id} rating updated to ${avg}★`
            }).catch(() => {});

            response.json({ destinationId: id, rating_average: avg });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    incrementHelpfulCount: async (request, response) => {
        try {
            const { id } = request.params;
            const result = await user_models.incrementHelpfulCount(id);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Feedback not found' });
            }
            user_models.logActivity({
                action: 'update', entityType: 'feedback',
                description: `Review ID ${id} marked as helpful`
            }).catch(() => {});
            response.json({ message: 'Helpful count incremented successfully' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    // ── Activity Logs Controller ──
    getActivityLogs: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }
            
            const filters = {
                user_id: request.query.user_id,
                action: request.query.action,
                entity_type: request.query.entity_type,
                entity_id: request.query.entity_id,
                start_date: request.query.start_date,
                end_date: request.query.end_date,
                limit: request.query.limit
            };
            
            const rows = await user_models.getActivityLogs(filters);
            response.json({ activityLogs: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    addActivityLog: async (request, response) => {
        try {
            const data = request.body;
            if (!data.action) {
                return response.status(400).json({ message: 'Action is required' });
            }
            const result = await user_models.addActivityLog(data);
            response.status(201).json({ message: 'Activity log added successfully', logId: result.insertId });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getActivityLogCount: async (request, response) => {
        try {
            const filters = {
                user_id: request.query.user_id,
                action: request.query.action,
                entity_type: request.query.entity_type,
                entity_id: request.query.entity_id
            };
            const count = await user_models.getActivityLogCount(filters);
            response.json({ count });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getRecentActivities: async (request, response) => {
        try {
            const limit = parseInt(request.query.limit) || 10;
            const rows = await user_models.getRecentActivities(limit);
            response.json({ recentActivities: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    // ── Notifications Controller ──
    getAllNotifications: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const filters = {};
            if (request.query.is_read)      filters.is_read    = request.query.is_read === 'true';
            if (request.query.unread_only)  filters.unread_only = request.query.unread_only === 'true';
            if (request.query.type)         filters.type       = request.query.type;
            if (request.query.user_id)      filters.user_id    = request.query.user_id;
            if (request.query.limit)        filters.limit      = parseInt(request.query.limit);

            const rows = await user_models.getAllNotifications(filters);
            response.json({ notifications: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getOneNotification: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const row = await user_models.getOneNotification(request.params.id);
            if (!row) return response.status(404).json({ message: 'Notification not found' });
            response.json(row);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    createNotification: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }

            const data = request.body;
            if (!data.title || !data.message) {
                return response.status(400).json({ message: 'Title and message are required' });
            }

            const result = await user_models.createNotification(data);
            const row = await user_models.getOneNotification(result.insertId);
            user_models.logActivity({
                userId: decoded.id,
                action: 'create',
                entityType: 'notification',
                description: `Created notification: "${data.title}"`
            }).catch(() => {});
            response.status(201).json(row);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    updateNotification: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }

            const { id } = request.params;
            const data = request.body;
            if (!data.title || !data.message) {
                return response.status(400).json({ message: 'Title and message are required' });
            }

            const result = await user_models.updateNotification(id, data);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Notification not found' });
            }
            user_models.logActivity({
                userId: decoded.id,
                action: 'update',
                entityType: 'notification',
                description: `Updated notification ID ${id}: "${data.title}"`
            }).catch(() => {});
            const row = await user_models.getOneNotification(id);
            response.json(row);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    markNotificationRead: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { id } = request.params;
            const result = await user_models.updateNotification(id, { is_read: true });
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Notification not found' });
            }
            response.json({ message: 'Notification marked as read' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    markAllNotificationsRead: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userId = decoded.role === 'admin' ? null : decoded.id;
            const result = await user_models.markAllNotificationsRead(userId || null);
            user_models.logActivity({
                userId: decoded.id,
                action: 'update',
                entityType: 'notification',
                description: `Marked all notifications as read`
            }).catch(() => {});
            response.json({ message: 'All notifications marked as read', affected: result.affectedRows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    deleteNotification: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }

            const { id } = request.params;
            const result = await user_models.deleteNotification(id);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Notification not found' });
            }
            user_models.logActivity({
                userId: decoded.id,
                action: 'delete',
                entityType: 'notification',
                description: `Deleted notification ID ${id}`
            }).catch(() => {});
            response.json({ message: 'Notification deleted' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    getNotificationStats: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const targetUserId = decoded.role === 'admin' ? null : decoded.id;

            const stats = await user_models.getNotificationStats(targetUserId);
            response.json(stats);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    /* ── Activities Controller ── */
    getAllActivities: async (request, response) => {
        try {
            const rows = await user_models.getAllActivities();
            response.json({ activities: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getActivityById: async (request, response) => {
        try {
            const { id } = request.params;
            const activity = await user_models.getActivityById(id);
            if (!activity) {
                return response.status(404).json({ message: 'Activity not found' });
            }
            response.json(activity);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    getActivitiesByCategory: async (request, response) => {
        try {
            const { category } = request.params;
            const rows = await user_models.getActivitiesByCategory(category);
            response.json({ activities: rows });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
    
    addActivity: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }
            const data = request.body;
            if (!data.name || !data.category) {
                return response.status(400).json({ message: 'Name and category are required' });
            }
            if (!data.event_date || !data.location) {
                return response.status(400).json({ message: 'Event date and location are required' });
            }
            const result = await user_models.addActivity(data);
            const newActivity = await user_models.getActivityById(result.insertId);
            user_models.logActivity({
                action: 'create', entityType: 'activities',
                description: `Added activity: "${data.name}" (${data.category})`
            }).catch(() => {});
            response.status(201).json(newActivity);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    updateActivity: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }
            const { id } = request.params;
            const data = request.body;
            const result = await user_models.updateActivity(id, data);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Activity not found' });
            }
            user_models.logActivity({
                action: 'update', entityType: 'activities',
                description: `Updated activity ID ${id}`
            }).catch(() => {});
            const updated = await user_models.getActivityById(id);
            response.json(updated);
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    deleteActivity: async (request, response) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'admin') {
                return response.status(403).json({ message: 'Admin access required' });
            }
            const { id } = request.params;
            const result = await user_models.deleteActivity(id);
            if (result.affectedRows === 0) {
                return response.status(404).json({ message: 'Activity not found' });
            }
            user_models.logActivity({
                action: 'delete', entityType: 'activities',
                description: `Deleted activity ID ${id}`
            }).catch(() => {});
            response.json({ message: 'Activity deleted successfully' });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    // ── Feedback Overview Stats (for Admin Dashboard stat cards) ──
    getFeedbackOverviewStats: async (_request, response) => {
        try {
            const [[countRow]]      = await database.execute("SELECT COUNT(*) AS total FROM feedback");
            const [[avgRow]]        = await database.execute("SELECT AVG(rating) AS avg_rating FROM feedback");
            const ratings           = await database.execute("SELECT rating, COUNT(*) AS cnt FROM feedback GROUP BY rating");
            const breakdown         = Object.fromEntries(ratings.map(r => [r.rating, r.cnt]));
            const totalReviews      = countRow.total    || 0;
            const averageRating     = parseFloat(avgRow.avg_rating)  || 0;
            response.json({
                totalReviews,
                averageRating,
                ratingBreakdown: breakdown,
            });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },

    // ── Feedback per-destination stats (for home-page destination cards) ──
    getFeedbackOverviewStatsByDestination: async (_request, response) => {
        try {
            const rows = await user_models.getDestinationRatingStats();
            response.json({
                destinations: rows.map(r => ({
                    id:               r.destination_id,
                    averageRating:    parseFloat(r.avg_rating)     || 0,
                    reviewCount:      parseInt(r.review_count)  || 0,
                })),
            });
        } catch (error) {
            response.status(500).json({ message: `Error: ${error.message}` });
        }
    },
};

export default user_controllers;