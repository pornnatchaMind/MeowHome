import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cat_community.db');

export const initDatabase = () => {
  try {
    db.execSync('PRAGMA foreign_keys = ON;');

    const schema = `
      -- 1. users
      CREATE TABLE IF NOT EXISTS users (
          user_id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          surname TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          profile_image TEXT NULL,
          terms_accepted INTEGER NOT NULL CHECK (terms_accepted IN (0, 1))
      );

      -- 2. cats
      CREATE TABLE IF NOT EXISTS cats (
          cat_id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          cat_name TEXT NOT NULL,
          cat_age TEXT NOT NULL,
          cat_breed TEXT NOT NULL,
          cat_gender TEXT NOT NULL,
          cat_images TEXT NOT NULL,
          father_cat_id TEXT NULL,
          mother_cat_id TEXT NULL,
          FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (father_cat_id) REFERENCES cats(cat_id) ON DELETE SET NULL,
          FOREIGN KEY (mother_cat_id) REFERENCES cats(cat_id) ON DELETE SET NULL
      );

      -- 3. lost_posts
      CREATE TABLE IF NOT EXISTS lost_posts (
          lost_post_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          cat_id TEXT NULL,
          lost_name TEXT NOT NULL,
          lost_age TEXT NOT NULL,
          lost_breed TEXT NOT NULL,
          lost_gender TEXT NOT NULL,
          lost_color TEXT NOT NULL,
          lost_description TEXT NULL,
          lost_latitude REAL NOT NULL,
          lost_longitude REAL NOT NULL,
          lost_location_name TEXT NOT NULL,
          lost_status TEXT NOT NULL,
          lost_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (cat_id) REFERENCES cats(cat_id) ON DELETE SET NULL
      );

      -- 4. adopt_posts
      CREATE TABLE IF NOT EXISTS adopt_posts (
          adopt_post_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          cat_id TEXT NULL,
          ownership_type TEXT NOT NULL,
          adopt_name TEXT NOT NULL,
          adopt_age TEXT NOT NULL,
          adopt_breed TEXT NOT NULL,
          adopt_gender TEXT NOT NULL,
          adopt_color TEXT NOT NULL,
          adopt_description TEXT NULL,
          adopt_latitude REAL NOT NULL,
          adopt_longitude REAL NOT NULL,
          adopt_location_name TEXT NOT NULL,
          adopt_status TEXT NOT NULL,
          adopt_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (cat_id) REFERENCES cats(cat_id) ON DELETE SET NULL
      );

      -- 5. social_posts
      CREATE TABLE IF NOT EXISTS social_posts (
          social_post_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          cat_id TEXT NULL,
          social_caption TEXT NOT NULL,
          social_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (cat_id) REFERENCES cats(cat_id) ON DELETE SET NULL
      );

      -- 6. post_images
      CREATE TABLE IF NOT EXISTS post_images (
          image_id TEXT NOT NULL PRIMARY KEY,
          post_type TEXT NOT NULL,
          post_id TEXT NOT NULL,
          image_url TEXT NOT NULL,
          is_cover INTEGER NOT NULL DEFAULT 0 CHECK (is_cover IN (0, 1)),
          uploaded_at TEXT NOT NULL
      );

      -- 7. question
      CREATE TABLE IF NOT EXISTS question (
          question_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          house_type TEXT NOT NULL,
          income_range TEXT NOT NULL,
          experience TEXT NOT NULL,
          other_pets TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      -- 8. favorites
      CREATE TABLE IF NOT EXISTS favorites (
          favorite_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          post_type TEXT NOT NULL,
          fav_post_id TEXT NOT NULL,
          fav_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      -- 9. chat_messages
      CREATE TABLE IF NOT EXISTS chat_messages (
          message_id TEXT NOT NULL PRIMARY KEY,
          sender_id TEXT NOT NULL,
          receiver_id TEXT NOT NULL,
          post_type TEXT NOT NULL,
          post_id TEXT NOT NULL,
          message_text TEXT NOT NULL,
          sent_at TEXT NOT NULL,
          FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      -- 10. likes
      CREATE TABLE IF NOT EXISTS likes (
          like_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          social_post_id TEXT NOT NULL,
          like_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (social_post_id) REFERENCES social_posts(social_post_id) ON DELETE CASCADE
      );

      -- 11. comments
      CREATE TABLE IF NOT EXISTS comments (
          comment_id TEXT NOT NULL PRIMARY KEY,
          social_post_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          comment_text TEXT NOT NULL,
          comment_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (social_post_id) REFERENCES social_posts(social_post_id) ON DELETE CASCADE
      );

      -- 12. follows
      CREATE TABLE IF NOT EXISTS follows (
          follow_id TEXT NOT NULL PRIMARY KEY,
          follower_id TEXT NOT NULL,
          following_id TEXT NOT NULL,
          follow_created_at TEXT NOT NULL,
          FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `;
    db.execSync(schema);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Init DB Error:', error);
  }
};

// 1. ตาราง users (ผู้ใช้งาน)

export const registerUser = (userData) => {
  const { userId, name, surname, phone, email, password, profileImage } = userData;
  return db.runSync(
    `INSERT INTO users (user_id, name, surname, phone, email, password, profile_image, terms_accepted)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [userId, name, surname, phone, email, password, profileImage || null]
  );
};

export const loginUser = (email, password) => {
  return db.getFirstSync(
    `SELECT user_id, name, surname, phone, email, profile_image 
     FROM users WHERE email = ? AND password = ?`,
    [email, password]
  );
};

export const getUserById = (userId) => {
  return db.getFirstSync(
    `SELECT user_id, name, surname, phone, email, profile_image 
     FROM users WHERE user_id = ?`,
    [userId]
  );
};

// 2. ตาราง cats (โปรไฟล์แมว)

export const addCat = (catData) => {
  const { catId, ownerId, catName, catAge, catBreed, catGender, catImages, fatherId, motherId } = catData;
  return db.runSync(
    `INSERT INTO cats (cat_id, owner_id, cat_name, cat_age, cat_breed, cat_gender, cat_images, father_cat_id, mother_cat_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [catId, ownerId, catName, catAge, catBreed, catGender, catImages, fatherId || null, motherId || null]
  );
};

export const getCatsByOwner = (ownerId) => {
  return db.getAllSync(
    `SELECT * FROM cats WHERE owner_id = ? ORDER BY cat_id DESC`,
    [ownerId]
  );
};

export const getCatDetailById = (catId) => {
  return db.getFirstSync(
    `SELECT c.*, 
            u.name AS owner_name, u.surname AS owner_surname, u.phone AS owner_phone, u.profile_image AS owner_image,
            f.cat_name AS father_name,
            m.cat_name AS mother_name
     FROM cats c
     JOIN users u ON c.owner_id = u.user_id
     LEFT JOIN cats f ON c.father_cat_id = f.cat_id
     LEFT JOIN cats m ON c.mother_cat_id = m.cat_id
     WHERE c.cat_id = ?`,
    [catId]
  );
};

// 3. ตาราง lost_posts (ประกาศแมวหาย)

export const createLostPost = (post) => {
  return db.runSync(
    `INSERT INTO lost_posts (lost_post_id, user_id, cat_id, lost_name, lost_age, lost_breed, lost_gender, lost_color, lost_description, lost_latitude, lost_longitude, lost_location_name, lost_status, lost_created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'lost', datetime('now'))`,
    [post.id, post.userId, post.catId || null, post.name, post.age, post.breed, post.gender, post.color, post.desc, post.lat, post.lng, post.locationName]
  );
};

export const getAllLostPosts = () => {
  return db.getAllSync(
    `SELECT lp.*, 
            u.name AS poster_name, u.phone AS poster_phone, u.profile_image AS poster_image,
            c.cat_images AS cat_profile_images
     FROM lost_posts lp
     JOIN users u ON lp.user_id = u.user_id
     LEFT JOIN cats c ON lp.cat_id = c.cat_id
     ORDER BY lp.lost_created_at DESC`
  );
};

// 4. ตาราง adopt_posts (โพสต์หาบ้านให้แมว)
export const createAdoptPost = (post) => {
  return db.runSync(
    `INSERT INTO adopt_posts (adopt_post_id, user_id, cat_id, ownership_type, adopt_name, adopt_age, adopt_breed, adopt_gender, adopt_color, adopt_description, adopt_latitude, adopt_longitude, adopt_location_name, adopt_status, adopt_created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', datetime('now'))`,
    [post.id, post.userId, post.catId || null, post.ownershipType, post.name, post.age, post.breed, post.gender, post.color, post.desc, post.lat, post.lng, post.locationName]
  );
};

export const getAllAdoptPosts = () => {
  return db.getAllSync(
    `SELECT ap.*, 
            u.name AS poster_name, u.phone AS poster_phone, u.profile_image AS poster_image,
            c.cat_images AS cat_profile_images
     FROM adopt_posts ap
     JOIN users u ON ap.user_id = u.user_id
     LEFT JOIN cats c ON ap.cat_id = c.cat_id
     ORDER BY ap.adopt_created_at DESC`
  );
};

// 5. ตาราง social_posts (โพสต์โซเชียล)

export const createSocialPost = (post) => {
  return db.runSync(
    `INSERT INTO social_posts (social_post_id, user_id, cat_id, social_caption, social_created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [post.id, post.userId, post.catId || null, post.caption]
  );
};

export const getAllSocialPosts = () => {
  return db.getAllSync(
    `SELECT sp.*, 
            u.name AS poster_name, u.profile_image AS poster_image, 
            c.cat_name, c.cat_breed
     FROM social_posts sp
     JOIN users u ON sp.user_id = u.user_id
     LEFT JOIN cats c ON sp.cat_id = c.cat_id
     ORDER BY sp.social_created_at DESC`
  );
};

// 6. ตาราง post_images (รูปภาพประกอบโพสต์)

export const addPostImage = (img) => {
  return db.runSync(
    `INSERT INTO post_images (image_id, post_type, post_id, image_url, is_cover, uploaded_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [img.id, img.postType, img.postId, img.imageUrl, img.isCover ? 1 : 0]
  );
};

export const getImagesByPost = (postType, postId) => {
  return db.getAllSync(
    `SELECT * FROM post_images 
     WHERE post_type = ? AND post_id = ? 
     ORDER BY is_cover DESC, uploaded_at ASC`,
    [postType, postId]
  );
};

// 7. ตาราง question (แบบสอบถามความพร้อมการรับเลี้ยง)
export const submitQuestion = (q) => {
  return db.runSync(
    `INSERT INTO question (question_id, user_id, house_type, income_range, experience, other_pets)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [q.id, q.userId, q.houseType, q.incomeRange, q.experience, q.otherPets]
  );
};

export const getQuestionByUserId = (userId) => {
  return db.getFirstSync(
    `SELECT q.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
     FROM question q
     JOIN users u ON q.user_id = u.user_id
     WHERE q.user_id = ?`,
    [userId]
  );
};

// 8. ตาราง favorites (รายการโปรด / บันทึกไว้ดู)

export const toggleFavorite = (favId, userId, postType, favPostId) => {
  const existing = db.getFirstSync(
    `SELECT favorite_id FROM favorites WHERE user_id = ? AND post_type = ? AND fav_post_id = ?`,
    [userId, postType, favPostId]
  );

  if (existing) {
    db.runSync(`DELETE FROM favorites WHERE favorite_id = ?`, [existing.favorite_id]);
    return { favorited: false };
  } else {
    db.runSync(
      `INSERT INTO favorites (favorite_id, user_id, post_type, fav_post_id, fav_created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [favId, userId, postType, favPostId]
    );
    return { favorited: true };
  }
};

export const getUserFavorites = (userId) => {
  return db.getAllSync(
    `SELECT * FROM favorites WHERE user_id = ? ORDER BY fav_created_at DESC`,
    [userId]
  );
};

export const checkIsFavorite = (userId, postType, postId) => {
  const result = db.getFirstSync(
    `SELECT favorite_id FROM favorites WHERE user_id = ? AND post_type = ? AND fav_post_id = ?`,
    [userId, postType, postId]
  );
  return Boolean(result);
};


// 9. ตาราง chat_messages (ข้อความแชท / แจ้งเบาะแส)

export const sendMessage = (msg) => {
  return db.runSync(
    `INSERT INTO chat_messages (message_id, sender_id, receiver_id, post_type, post_id, message_text, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [msg.id, msg.senderId, msg.receiverId, msg.postType, msg.postId, msg.text]
  );
};

export const getChatMessages = (postId, user1, user2) => {
  return db.getAllSync(
    `SELECT m.*, u.name AS sender_name, u.profile_image AS sender_image
     FROM chat_messages m
     JOIN users u ON m.sender_id = u.user_id
     WHERE m.post_id = ? 
       AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
     ORDER BY m.sent_at ASC`,
    [postId, user1, user2, user2, user1]
  );
};

// 10. ตาราง likes (การกดไลก์)

export const toggleLike = (likeId, userId, socialPostId) => {
  const existing = db.getFirstSync(
    `SELECT like_id FROM likes WHERE user_id = ? AND social_post_id = ?`,
    [userId, socialPostId]
  );

  if (existing) {
    db.runSync(`DELETE FROM likes WHERE like_id = ?`, [existing.like_id]);
    return { liked: false };
  } else {
    db.runSync(
      `INSERT INTO likes (like_id, user_id, social_post_id, like_created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [likeId, userId, socialPostId]
    );
    return { liked: true };
  }
};

export const getLikesCount = (socialPostId) => {
  const result = db.getFirstSync(
    `SELECT COUNT(*) AS total FROM likes WHERE social_post_id = ?`,
    [socialPostId]
  );
  return result ? result.total : 0;
};

export const checkUserLiked = (userId, socialPostId) => {
  const result = db.getFirstSync(
    `SELECT like_id FROM likes WHERE user_id = ? AND social_post_id = ?`,
    [userId, socialPostId]
  );
  return Boolean(result);
};

// 11. ตาราง comments (ความคิดเห็น)

export const addComment = (commentId, socialPostId, userId, commentText) => {
  return db.runSync(
    `INSERT INTO comments (comment_id, social_post_id, user_id, comment_text, comment_created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [commentId, socialPostId, userId, commentText]
  );
};

export const getCommentsByPost = (socialPostId) => {
  return db.getAllSync(
    `SELECT c.*, u.name AS commenter_name, u.profile_image AS commenter_image
     FROM comments c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.social_post_id = ?
     ORDER BY c.comment_created_at ASC`,
    [socialPostId]
  );
};

// 12. ตาราง follows (การติดตาม)

export const toggleFollow = (followId, followerId, followingId) => {
  const existing = db.getFirstSync(
    `SELECT follow_id FROM follows WHERE follower_id = ? AND following_id = ?`,
    [followerId, followingId]
  );

  if (existing) {
    db.runSync(`DELETE FROM follows WHERE follow_id = ?`, [existing.follow_id]);
    return { following: false };
  } else {
    db.runSync(
      `INSERT INTO follows (follow_id, follower_id, following_id, follow_created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [followId, followerId, followingId]
    );
    return { following: true };
  }
};

export const getFollowers = (userId) => {
  return db.getAllSync(
    `SELECT f.*, u.name AS follower_name, u.profile_image AS follower_image
     FROM follows f
     JOIN users u ON f.follower_id = u.user_id
     WHERE f.following_id = ?`,
    [userId]
  );
};

export const getFollowing = (userId) => {
  return db.getAllSync(
    `SELECT f.*, u.name AS following_name, u.profile_image AS following_image
     FROM follows f
     JOIN users u ON f.following_id = u.user_id
     WHERE f.follower_id = ?`,
    [userId]
  );
};

export const getFollowersCount = (userId) => {
  const result = db.getFirstSync(
    `SELECT COUNT(*) AS total FROM follows WHERE following_id = ?`,
    [userId]
  );
  return result ? result.total : 0;
};

export const checkIsFollowing = (followerId, followingId) => {
  const result = db.getFirstSync(
    `SELECT follow_id FROM follows WHERE follower_id = ? AND following_id = ?`,
    [followerId, followingId]
  );
  return Boolean(result);
};

export default db;