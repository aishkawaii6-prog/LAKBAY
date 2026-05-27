import express from "express";
import user_controllers from "../controllers/userControllers.js";

const router = express.Router();

/* User Routes */
router.post("/add-user", user_controllers.insert);
router.get("/users", user_controllers.get);
router.put("/edit-user/:id", user_controllers.edit);
router.delete("/delete-user/:id", user_controllers.delete);

/* Auth Routes - mapped to existing user routes */
router.post("/auth/register", user_controllers.insert);
router.post("/auth/login", user_controllers.login);
router.post("/auth/admin/login", user_controllers.adminLogin);
router.post("/auth/forgot-password", user_controllers.forgotPassword);
router.post("/auth/verify-reset-token", user_controllers.verifyResetToken);
router.post("/auth/reset-password", user_controllers.resetPassword);
router.get("/auth/me", user_controllers.getProfile);
router.put("/auth/profile", user_controllers.edit);
router.post("/auth/change-password", user_controllers.changePassword);
router.get("/auth/users", user_controllers.get);
router.post("/auth/logout", user_controllers.logout);

/* Messages Routes */
router.post("/messages", user_controllers.sendMessage);
router.get("/messages", user_controllers.getMessages);
router.put("/messages/:id", user_controllers.updateMessage);
router.delete("/messages/:id", user_controllers.deleteMessage);
router.get("/messages/stats/summary", user_controllers.getMessageStats);

/* Destinations Routes */
router.get("/destinations", user_controllers.getAllDestinations);
router.get("/destinations/:id", user_controllers.getOneDestination);
router.post("/destinations", user_controllers.addDestination);
router.put("/destinations/:id", user_controllers.updateDestination);
router.delete("/destinations/:id", user_controllers.deleteDestination);
router.post("/destinations/:id/rate", user_controllers.rateDestination);

/* News Routes — fully DB-backed */
router.get("/news", user_controllers.getNews);           // public listing (published only)
router.get("/news/all", user_controllers.getAllNews);    // admin: all rows
router.get("/news/:id", user_controllers.getOneNews);
router.post("/news", user_controllers.addNews);
router.put("/news/:id", user_controllers.updateNews);
router.delete("/news/:id", user_controllers.deleteNews);

/* Bookmarks Routes */
router.get("/bookmarks/:userId", user_controllers.getUserBookmarks);
router.get("/bookmarks/check/:userId/:destinationId", user_controllers.isBookmarked);
router.post("/bookmarks", user_controllers.addBookmark);
router.delete("/bookmarks/:userId/:destinationId", user_controllers.removeBookmark);
router.get("/bookmarks/count/:destinationId", user_controllers.getDestinationBookmarkCount);

/* Gallery Routes */
router.get("/gallery", user_controllers.getAllGalleryImages);
router.get("/gallery/destination/:destinationId", user_controllers.getGalleryByDestination);
router.get("/gallery/featured", user_controllers.getFeaturedGalleryImages);
router.post("/gallery", user_controllers.addGalleryImage);
router.put("/gallery/:id", user_controllers.updateGalleryImage);
router.delete("/gallery/:id", user_controllers.deleteGalleryImage);

/* Feedback Routes */
router.get("/feedback", user_controllers.getAllFeedback);
router.get("/feedback/overview-stats", user_controllers.getFeedbackOverviewStats);
router.get("/feedback/destination/:destinationId", user_controllers.getFeedbackByDestination);
router.get("/feedback/count/:destinationId", user_controllers.getFeedbackCountByDestination);
router.get("/feedback/rating/:destinationId", user_controllers.getAverageRatingByDestination);
router.post("/feedback", user_controllers.addFeedback);
router.put("/feedback/:id", user_controllers.updateFeedback);
router.delete("/feedback/:id", user_controllers.deleteFeedback);
router.put("/feedback/helpful/:id", user_controllers.incrementHelpfulCount);

/* Activity Logs Routes */
router.get("/activity-logs", user_controllers.getActivityLogs);
router.post("/activity-logs", user_controllers.addActivityLog);
router.get("/activity-logs/count", user_controllers.getActivityLogCount);
router.get("/activity-logs/recent", user_controllers.getRecentActivities);

/* Feedback destination-stats (loads avg + count per destination) */
router.get("/feedback/destination-stats", user_controllers.getFeedbackOverviewStatsByDestination);

/* Notifications Routes */
router.get("/notifications",                  user_controllers.getAllNotifications);
router.get("/notifications/:id",              user_controllers.getOneNotification);
router.post("/notifications",                 user_controllers.createNotification);
router.put("/notifications/:id",              user_controllers.updateNotification);
router.delete("/notifications/:id",           user_controllers.deleteNotification);
router.put("/notifications/:id/read",         user_controllers.markNotificationRead);
router.put("/notifications/read-all",         user_controllers.markAllNotificationsRead);
router.get("/notifications/stats/summary",    user_controllers.getNotificationStats);

/* Activities Routes */
router.get("/activities", user_controllers.getAllActivities);
router.get("/activities/:id", user_controllers.getActivityById);
router.get("/activities/category/:category", user_controllers.getActivitiesByCategory);
router.post("/activities", user_controllers.addActivity);
router.put("/activities/:id", user_controllers.updateActivity);
router.delete("/activities/:id", user_controllers.deleteActivity);

export default router;