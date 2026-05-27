-- Lakbay Database - Complete Schema for Calbayog Tourism Website

CREATE DATABASE IF NOT EXISTS Lakbay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Lakbay;

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
    email VARCHAR(255),
    phone VARCHAR(20),
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Destinations Table (tourist spots)
CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('Waterfall', 'Beach', 'Heritage', 'Park', 'Adventure', 'Ecological', 'Cultural', 'Historical') NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    coverImage TEXT,
    images JSON NOT NULL DEFAULT (JSON_ARRAY()),
    history TEXT NOT NULL DEFAULT '',
    discovery TEXT NOT NULL DEFAULT '',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    mapUrl TEXT NOT NULL DEFAULT '',
    latitude DECIMAL(10,8) NOT NULL DEFAULT 0,
    longitude DECIMAL(11,8) NOT NULL DEFAULT 0,
    status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
    view_count INT NOT NULL DEFAULT 0,
    rating_average DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    INDEX idx_status (status),
    FULLTEXT idx_search (name, description, location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News Table
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    coverImage TEXT NOT NULL DEFAULT '',
    category ENUM('announcement', 'event', 'news', 'update', 'feature') NOT NULL DEFAULT 'news',
    tags JSON NOT NULL DEFAULT (JSON_ARRAY()),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_published (published),
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    FULLTEXT idx_search (title, content, excerpt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages Table (contact form submissions)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    user_id INT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    read_at TIMESTAMP NULL,
    replied_at TIMESTAMP NULL,
    reply_message TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feedback/Reviews Table
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL,
    user_id INT NULL,
    name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date DATE NOT NULL,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_spot_id (spot_id),
    INDEX idx_rating (rating),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookmark/Wishlist Table
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, destination_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Visited Places Table
CREATE TABLE IF NOT EXISTS visited_places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination_id INT NOT NULL,
    visit_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_visit (user_id, destination_id),
    INDEX idx_user_id (user_id),
    INDEX idx_destination_id (destination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Info Table
CREATE TABLE IF NOT EXISTS contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('office', 'emergency', 'tourism', 'booking') NOT NULL DEFAULT 'office',
    label VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(100) NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    office_hours VARCHAR(255) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_contact_type_label (type, label)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activities/Things to Do Table
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(100),
    order_sequence INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_activity_name (name),
    INDEX idx_category (category),
    INDEX idx_order (order_sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Image Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NULL,
    title VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    INDEX idx_destination (destination_id),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '🔔',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('system','message','feedback','news','password','event','destination','general') NOT NULL DEFAULT 'system',
    badge VARCHAR(20) NULL,
    badge_color VARCHAR(20) NULL DEFAULT '#2563eb',
    priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    end_date DATE,
    end_time TIME,
    location TEXT,
    organizer VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    registration_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PHP',
    category ENUM('festival', 'cultural', 'sports', 'eco', 'religious', 'community') DEFAULT 'festival',
    featured BOOLEAN DEFAULT FALSE,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_date (event_date),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs Table (activity tracking)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (for testing)
-- Password: admin123
INSERT INTO users (fullname, username, password, role, email)
VALUES ('Administrator', 'admin', '$2b$10$vgbzxSvKKlbnzd5LIdmeTuLFJ9/3Lq2DIId1LZz0vNmNVv9gQ0cle', 'admin', 'admin@lakbay.com')
ON DUPLICATE KEY UPDATE username=username;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('site_name', 'Lakbay Calbayog', 'Website name'),
('site_tagline', 'Explore the Beauty of Calbayog City', 'Website tagline'),
('contact_email', 'info@lakbaycalbayog.ph', 'Main contact email'),
('contact_phone', '+63 55 123 4567', 'Main contact phone'),
('address', 'Calbayog City, Samar, Philippines', 'Main office address')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- Insert default contact info
INSERT INTO contact_info (type, label, phone, email, address, office_hours) VALUES
('office', 'Tourism Office', '+63 55 123 4567', 'info@lakbaycalbayog.ph', 'Tourism Center, Calbayog City Hall', 'Mon-Fri 8AM-5PM'),
('emergency', 'Emergency Hotline', '+63 55 999 8888', '', 'Calbayog City', '24/7')
ON DUPLICATE KEY UPDATE type=type;

-- Insert sample destinations from DEFAULT_SPOTS (with precise coordinates)
INSERT INTO destinations (id, name, category, location, description, coverImage, featured, latitude, longitude) VALUES
(1, 'Bangon Falls',            'Waterfall', 'Barangay Bangon, Calbayog City, Samar',              'Bangon Falls cascades dramatically over wide rocky formations into a deep emerald-green natural pool.', '/assets/images/bangon-falls.webp',  TRUE,  12.06740000, 124.59640000),
(2, 'Tarangban Falls',         'Waterfall', 'Barangay Tarangban, Calbayog City, Samar',           'Tarangban Falls is the crown jewel of Calbayog waterfalls with multi-tiered silky curtain.',           '/assets/images/tarangban-falls.jpg', TRUE,  12.06970000, 124.59210000),
(3, 'Malajog Beach',           'Beach',     'Barangay Malajog, Calbayog City, Samar',             'Premier beach destination with crystal-clear waters and famous 912-meter sea zipline.',                 '/assets/images/malajog-beach.jpg',   TRUE,  12.04560000, 124.61230000),
(4, 'Sts. Peter & Paul Cathedral', 'Heritage', 'JD Avelino ST., Brgy. West Awang, Calbayog City, Samar', 'Largest church in Samar, blending Spanish-era stone walls with historical architecture.',        '/assets/images/cathedral.jpg',       FALSE, 12.06710000, 124.59570000),
(5, 'Nijaga Park',             'Park',      'Brgy Obrero, Gomez Street, Calbayog City, Samar',   'Largest public green space with walking paths and artificial waterfall replica.',                      '/assets/images/nijaga-park.webp',    FALSE, 12.06330000, 124.60340000),
(6, 'Longsob Cave',            'Adventure', 'Barangay Longsob, Calbayog City, Samar',             'Underground world of emerald pools, moss-covered formations, and hidden chambers.',                    '/assets/images/longsob-cave.jpg',    FALSE, 12.08210000, 124.61780000)
ON DUPLICATE KEY UPDATE
  latitude  = VALUES(latitude),
  longitude = VALUES(longitude),
  location  = VALUES(location);

-- Insert sample news
INSERT INTO news (id, title, content, category, featured, published) VALUES
(1, 'Welcome to Calbayog City', 'Discover the breathtaking beauty of Calbayog City, known as the City of Waterfalls. Explore our pristine beaches, heritage sites, and adventure destinations.', 'announcement', TRUE, TRUE),
(2, 'Tarangban Falls Achieves Premium Certification', 'Tarangban Falls has been officially certified as a premium eco-tourism destination by the Department of Tourism.', 'news', TRUE, TRUE)
ON DUPLICATE KEY UPDATE title=title;

-- Insert sample feedback
INSERT INTO feedback (id, spot_id, name, rating, comment, date) VALUES
(1, 1, 'Maria Santos', 5, 'Absolutely stunning! The trek through the forest makes reaching the falls even more rewarding.', '2024-03-15'),
(2, 2, 'Jose Reyes', 5, 'The most beautiful waterfall I have ever seen. Truly world-class.', '2024-03-20'),
(3, 3, 'Ana Dela Cruz', 4, 'The zipline over the sea is absolutely thrilling! Perfect spot for adventure and relaxation.', '2024-04-01'),
(4, 4, 'Roberto Cruz', 5, 'A magnificent piece of living history. Breathtaking at dusk.', '2024-04-10'),
(5, 5, 'Liza Fernandez', 4, 'A lovely spot to relax. Beautiful at night when lit up.', '2024-04-15'),
(6, 6, 'Marco Santos', 5, 'Entering by boat through narrow passage is magical experience.', '2024-04-20')
ON DUPLICATE KEY UPDATE spot_id=spot_id;

-- Insert sample activities
INSERT INTO activities (name, description, icon, category, order_sequence) VALUES
('Hiking', 'Explore scenic trails and mountain paths', '🥾', 'Adventure', 1),
('Swimming', 'Enjoy crystal-clear waters and pools', '🏊', 'Water', 2),
('Photography', 'Capture stunning landscapes and moments', '📸', 'Recreation', 3),
('Camping', 'Experience overnight stays in nature', '⛺', 'Adventure', 4),
('Picnic', 'Relax with family and friends outdoors', '🧺', 'Recreation', 5),
('Ziplining', 'Soar above scenic landscapes', '🪂', 'Adventure', 6)
ON DUPLICATE KEY UPDATE name=name;

-- Seed sample activity logs
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at)
VALUES
  (1, 'create',  'destination', 1, 'New destination added: Bangon Falls',     '2024-03-01 08:15:00'),
  (1, 'create',  'destination', 2, 'New destination added: Tarangban Falls',  '2024-03-01 08:20:00'),
  (1, 'create',  'destination', 3, 'New destination added: Malajog Beach',    '2024-03-01 08:25:00'),
  (1, 'create',  'destination', 4, 'New destination added: Sts. Peter & Paul Cathedral','2024-03-01 08:30:00'),
  (1, 'create',  'destination', 5, 'New destination added: Nijaga Park',      '2024-03-01 08:35:00'),
  (1, 'create',  'destination', 6, 'New destination added: Longsob Cave',     '2024-03-01 08:40:00'),
  (1, 'create',  'news',        1, 'News published: Welcome to Calbayog City', '2024-03-05 09:00:00'),
  (1, 'update',  'destination', 1, 'Destination updated: Bangon Falls',       '2024-03-08 10:10:00'),
  (1, 'create',  'news',        2, 'News published: Tarangban Falls Achieves Premium Certification', '2024-03-10 11:00:00'),
  (1, 'update',  'destination', 3, 'Destination updated: Malajog Beach',      '2024-03-12 14:22:00'),
  (1, 'create',  'feedback',    1, 'New review by Maria Santos: 5★',          '2024-03-15 07:30:00'),
  (1, 'create',  'feedback',    2, 'New review by Jose Reyes: 5★',            '2024-03-20 09:45:00'),
  (1, 'create',  'feedback',    3, 'New review by Ana Dela Cruz: 4★',         '2024-04-01 16:00:00'),
  (1, 'update',  'news',        1, 'News updated: Welcome to Calbayog City',   '2024-04-05 08:00:00'),
  (1, 'create',  'feedback',    4, 'New review by Roberto Cruz: 5★',          '2024-04-10 13:15:00'),
  (1, 'create',  'feedback',    5, 'New review by Liza Fernandez: 4★',        '2024-04-15 18:40:00'),
  (1, 'create',  'feedback',    6, 'New review by Marco Santos: 5★',          '2024-04-20 19:10:00'),
  (1, 'update',  'destination', 2, 'Destination updated: Tarangban Falls',    '2024-04-22 10:00:00'),
  (1, 'create',  'gallery',     1, 'Gallery image added for destination 1: Bangon Falls cover',  '2024-03-01 09:00:00'),
  (1, 'create',  'gallery',     2, 'Gallery image added for destination 2: Tarangban cover',    '2024-03-01 09:05:00'),
  (1, 'create',  'gallery',     3, 'Gallery image added for destination 3: Malajog cover',      '2024-03-01 09:10:00'),
  (1, 'create',  'activities',  1, 'Activity added: Hiking (Adventure)',        '2024-03-01 10:00:00'),
  (1, 'create',  'activities',  2, 'Activity added: Swimming (Water)',          '2024-03-01 10:01:00'),
  (1, 'create',  'activities',  3, 'Activity added: Photography (Recreation)',  '2024-03-01 10:02:00'),
  (1, 'login',   'user',        1, 'User logged in: admin',                      NOW()),
  (1, 'logout',  'user',        1, 'User logged out',                            NOW()),
  (NULL, 'create', 'message',   1, 'New contact message from: John Doe <john@example.com>', NOW())
ON DUPLICATE KEY UPDATE description=description;

-- ─── Password Reset Tokens ───
CREATE TABLE IF NOT EXISTS reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
--  Activity Log MySQL Triggers  (failsafe — app-level logging is the primary path)
--  These fire automatically inside the MySQL server whenever a row
--  in a tracked table is INSERTed, UPDATEd, or DELETEd — even if
--  the modification is done via phpMyAdmin, a raw SQL client, etc.
-- ═══════════════════════════════════════════════════════════

DELIMITER //

-- ─── destinations ───
DROP TRIGGER IF EXISTS destinations_ai//
CREATE TRIGGER destinations_ai
AFTER INSERT ON destinations
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('create', 'destination', NEW.id,
            CONCAT('New destination added: ', NEW.name), NOW());
END//

DROP TRIGGER IF EXISTS destinations_au//
CREATE TRIGGER destinations_au
AFTER UPDATE ON destinations
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('update', 'destination', NEW.id,
            CONCAT('Destination updated: ', NEW.name), NOW());
END//

DROP TRIGGER IF EXISTS destinations_ad//
CREATE TRIGGER destinations_ad
AFTER DELETE ON destinations
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('delete', 'destination', OLD.id,
            CONCAT('Destination deleted: ', OLD.name), NOW());
END//

-- ─── messages ───
DROP TRIGGER IF EXISTS messages_ai//
CREATE TRIGGER messages_ai
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('create', 'message', NEW.id,
            CONCAT('New contact message from: ', NEW.name, ' <', NEW.email, '>'), NOW());
END//

DROP TRIGGER IF EXISTS messages_au//
CREATE TRIGGER messages_au
AFTER UPDATE ON messages
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('update', 'message', NEW.id,
            CONCAT('Message updated: ID ', NEW.id, ' status=', COALESCE(NEW.status,'?')), NOW());
END//

DROP TRIGGER IF EXISTS messages_ad//
CREATE TRIGGER messages_ad
AFTER DELETE ON messages
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('delete', 'message', OLD.id,
            CONCAT('Message deleted: ID ', OLD.id), NOW());
END//

-- ─── news ───
DROP TRIGGER IF EXISTS news_ai//
CREATE TRIGGER news_ai
AFTER INSERT ON news
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('create', 'news', NEW.id,
            CONCAT('News published: ', NEW.title), NOW());
END//

DROP TRIGGER IF EXISTS news_au//
CREATE TRIGGER news_au
AFTER UPDATE ON news
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('update', 'news', NEW.id,
            CONCAT('News updated: ', NEW.title), NOW());
END//

DROP TRIGGER IF EXISTS news_ad//
CREATE TRIGGER news_ad
AFTER DELETE ON news
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('delete', 'news', OLD.id,
            CONCAT('News deleted: ', OLD.title), NOW());
END//

-- ─── feedback ───
DROP TRIGGER IF EXISTS feedback_ai//
CREATE TRIGGER feedback_ai
AFTER INSERT ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('create', 'feedback', NEW.id,
            CONCAT('New review added by ', NEW.name, ': ', NEW.rating, '★'), NOW());
END//

DROP TRIGGER IF EXISTS feedback_au//
CREATE TRIGGER feedback_au
AFTER UPDATE ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('update', 'feedback', NEW.id,
            CONCAT('Review updated: ID ', NEW.id), NOW());
END//

DROP TRIGGER IF EXISTS feedback_ad//
CREATE TRIGGER feedback_ad
AFTER DELETE ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('delete', 'feedback', OLD.id,
            CONCAT('Review deleted: ID ', OLD.id), NOW());
END//

-- ─── bookmarks ───
DROP TRIGGER IF EXISTS bookmarks_ai//
CREATE TRIGGER bookmarks_ai
AFTER INSERT ON bookmarks
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('create', 'bookmark', NEW.id,
            CONCAT('Bookmark added: user ', NEW.user_id, ' → destination ', NEW.destination_id), NOW());
END//

DROP TRIGGER IF EXISTS bookmarks_ad//
CREATE TRIGGER bookmarks_ad
AFTER DELETE ON bookmarks
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('delete', 'bookmark', OLD.id,
            CONCAT('Bookmark removed: user ', OLD.user_id, ' → destination ', OLD.destination_id), NOW());
END//

-- ─── gallery ───
DROP TRIGGER IF EXISTS gallery_ai//
CREATE TRIGGER gallery_ai
AFTER INSERT ON gallery
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('create', 'gallery', NEW.id,
            CONCAT('Gallery image added for destination ', COALESCE(NEW.destination_id,'n/a'), ': ', COALESCE(NEW.title,'untitled')), NOW());
END//

DROP TRIGGER IF EXISTS gallery_au//
CREATE TRIGGER gallery_au
AFTER UPDATE ON gallery
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('update', 'gallery', NEW.id,
            CONCAT('Gallery image updated: ID ', NEW.id, ' ', COALESCE(NEW.title,'')), NOW());
END//

DROP TRIGGER IF EXISTS gallery_ad//
CREATE TRIGGER gallery_ad
AFTER DELETE ON gallery
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('delete', 'gallery', OLD.id,
            CONCAT('Gallery image deleted: ID ', OLD.id), NOW());
END//

-- ─── activities ───
DROP TRIGGER IF EXISTS activities_ai//
CREATE TRIGGER activities_ai
AFTER INSERT ON activities
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('create', 'activities', NEW.id,
            CONCAT('Activity added: ', NEW.name, ' (', NEW.category, ')'), NOW());
END//

DROP TRIGGER IF EXISTS activities_au//
CREATE TRIGGER activities_au
AFTER UPDATE ON activities
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('update', 'activities', NEW.id,
            CONCAT('Activity updated: ', NEW.name), NOW());
END//

DROP TRIGGER IF EXISTS activities_ad//
CREATE TRIGGER activities_ad
AFTER DELETE ON activities
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('delete', 'activities', OLD.id,
            CONCAT('Activity deleted: ', OLD.name), NOW());
END//

-- ─── notifications ───
DROP TRIGGER IF EXISTS notifications_ai//
CREATE TRIGGER notifications_ai
AFTER INSERT ON notifications
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('create', 'notification', NEW.id,
            CONCAT('Notification created: ', NEW.title), NOW());
END//

DROP TRIGGER IF EXISTS notifications_au//
CREATE TRIGGER notifications_au
AFTER UPDATE ON notifications
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('update', 'notification', NEW.id,
            CONCAT('Notification updated: ', NEW.title), NOW());
END//

DROP TRIGGER IF EXISTS notifications_ad//
CREATE TRIGGER notifications_ad
AFTER DELETE ON notifications
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (action, entity_type, entity_id, description, created_at)
    VALUES ('delete', 'notification', OLD.id,
            CONCAT('Notification deleted: ', OLD.title), NOW());
END//

DELIMITER ;
