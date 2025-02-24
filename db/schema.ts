import { integer, pgTable, serial, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// ContentCreator Table
export const contentCreators = pgTable("content_creators", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriber Table
export const subscribers = pgTable("subscribers", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content Table
export const contents = pgTable("contents", {
    id: serial("id").primaryKey(),
    creatorId: integer("creator_id").references(() => contentCreators.id),
    modelInfo: jsonb("model_info"),
    isPublic: boolean("is_public").notNull(),
    sharingId: text("sharing_id").unique(),
    ready: boolean("ready").default(false).notNull(), // New field
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ContentRegistration Table
export const contentRegistrations = pgTable("content_registrations", {
    id: serial("id").primaryKey(),
    subscriberId: integer("subscriber_id").references(() => subscribers.id),
    contentId: integer("content_id").references(() => contents.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Thread Table
export const threads = pgTable("threads", {
    id: serial("id").primaryKey(),
    subscriberId: integer("subscriber_id").references(() => subscribers.id),
    contentId: integer("content_id").references(() => contents.id),
    messages: jsonb("messages"),
    metaInfo: jsonb("meta_info"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const contentCreatorsRelations = relations(contentCreators, ({ many }) => ({
    contents: many(contents),
}));

export const subscribersRelations = relations(subscribers, ({ many }) => ({
    threads: many(threads),
    contentRegistrations: many(contentRegistrations),
}));

export const contentsRelations = relations(contents, ({ one, many }) => ({
    creator: one(contentCreators, {
        fields: [contents.creatorId],
        references: [contentCreators.id],
    }),
    threads: many(threads),
    contentRegistrations: many(contentRegistrations),
}));

export const contentRegistrationsRelations = relations(contentRegistrations, ({ one }) => ({
    subscriber: one(subscribers, {
        fields: [contentRegistrations.subscriberId],
        references: [subscribers.id],
    }),
    content: one(contents, {
        fields: [contentRegistrations.contentId],
        references: [contents.id],
    }),
}));

export const threadsRelations = relations(threads, ({ one }) => ({
    subscriber: one(subscribers, {
        fields: [threads.subscriberId],
        references: [subscribers.id],
    }),
    content: one(contents, {
        fields: [threads.contentId],
        references: [contents.id],
    }),
}));

// Zod Schemas
export const insertContentCreatorSchema = createInsertSchema(contentCreators);
export const selectContentCreatorSchema = createSelectSchema(contentCreators);
export const insertSubscriberSchema = createInsertSchema(subscribers);
export const selectSubscriberSchema = createSelectSchema(subscribers);
export const insertContentSchema = createInsertSchema(contents);
export const selectContentSchema = createSelectSchema(contents);
export const insertThreadSchema = createInsertSchema(threads);
export const selectThreadSchema = createSelectSchema(threads);

// Types
export type InsertContentCreator = typeof contentCreators.$inferInsert;
export type SelectContentCreator = typeof contentCreators.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;
export type SelectSubscriber = typeof subscribers.$inferSelect;
export type InsertContent = typeof contents.$inferInsert;
export type SelectContent = typeof contents.$inferSelect;
export type InsertThread = typeof threads.$inferInsert;
export type SelectThread = typeof threads.$inferSelect;