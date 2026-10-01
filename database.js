import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cat_community.db');

export const initDatabase = () => {
  try {
    db.execSync('PRAGMA foreign_keys = ON;');

    const schema = `
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

      CREATE TABLE IF NOT EXISTS social_posts (
          social_post_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          cat_id TEXT NULL,
          social_caption TEXT NOT NULL,
          social_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (cat_id) REFERENCES cats(cat_id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS post_images (
          image_id TEXT NOT NULL PRIMARY KEY,
          post_type TEXT NOT NULL,
          post_id TEXT NOT NULL,
          image_url TEXT NOT NULL,
          is_cover INTEGER NOT NULL DEFAULT 0 CHECK (is_cover IN (0, 1)),
          uploaded_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS question (
          question_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          house_type TEXT NOT NULL,
          income_range TEXT NOT NULL,
          experience TEXT NOT NULL,
          other_pets TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS favorites (
          favorite_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          post_type TEXT NOT NULL,
          fav_post_id TEXT NOT NULL,
          fav_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );

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

      CREATE TABLE IF NOT EXISTS likes (
          like_id TEXT NOT NULL PRIMARY KEY,
          user_id TEXT NOT NULL,
          social_post_id TEXT NOT NULL,
          like_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (social_post_id) REFERENCES social_posts(social_post_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS comments (
          comment_id TEXT NOT NULL PRIMARY KEY,
          social_post_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          comment_text TEXT NOT NULL,
          comment_created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (social_post_id) REFERENCES social_posts(social_post_id) ON DELETE CASCADE
      );

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
    console.error('Failed to init DB:', error);
  }
};

export default db;