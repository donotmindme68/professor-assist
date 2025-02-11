import {integer, pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";
import {createInsertSchema, createSelectSchema} from "drizzle-zod";
import {relations} from "drizzle-orm";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const threads = pgTable("threads", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    subjectType: text("subject_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    threadId: integer("thread_id").references(() => threads.id),
    content: text("content").notNull(),
    role: text("role").notNull(), // 'user', 'system', 'assistant'
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
    id: serial("id").primaryKey(),
    messageId: integer("message_id").references(() => messages.id),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    path: text("path").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({many}) => ({
    threads: many(threads),
}));

export const threadsRelations = relations(threads, ({one, many}) => ({
    user: one(users, {
        fields: [threads.userId],
        references: [users.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
    thread: one(threads, {
        fields: [messages.threadId],
        references: [threads.id],
    }),
    files: many(files),
}));

export const filesRelations = relations(files, ({one}) => ({
    message: one(messages, {
        fields: [files.messageId],
        references: [messages.id],
    }),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertThreadSchema = createInsertSchema(threads);
export const selectThreadSchema = createSelectSchema(threads);
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const insertFileSchema = createInsertSchema(files);
export const selectFileSchema = createSelectSchema(files);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertThread = typeof threads.$inferInsert;
export type SelectThread = typeof threads.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type SelectMessage = typeof messages.$inferSelect;
export type InsertFile = typeof files.$inferInsert;
export type SelectFile = typeof files.$inferSelect;