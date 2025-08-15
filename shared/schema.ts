import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stagename: varchar("stagename").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bands = pgTable("bands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  genre: text("genre").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  founded: integer("founded"),
  members: text("members").array(),
  albums: text("albums").array(),
  website: text("website"),
  instagram: text("instagram"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bandId: varchar("band_id").notNull().references(() => bands.id),
  stagename: text("stagename").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  reviewType: text("review_type").notNull(), // 'band', 'album', 'concert'
  targetName: text("target_name"), // album name or concert venue
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bandId: varchar("band_id").references(() => bands.id),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // 'live', 'promo', 'backstage', 'equipment'
  uploadedBy: text("uploaded_by").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bandId: varchar("band_id").notNull().references(() => bands.id),
  tourName: text("tour_name").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  date: timestamp("date").notNull(),
  ticketUrl: text("ticket_url"),
  ticketmasterUrl: text("ticketmaster_url"),
  seatgeekUrl: text("seatgeek_url"),
  price: text("price"),
  status: text("status").default("upcoming"), // 'upcoming', 'sold_out', 'cancelled'
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  authorStagename: text("author_stagename").notNull(),
  category: text("category").default("general"), // 'general', 'band_discussion', 'gear', 'events'
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBandSchema = createInsertSchema(bands).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export type Band = typeof bands.$inferSelect;
export type InsertBand = z.infer<typeof insertBandSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Tour = typeof tours.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
