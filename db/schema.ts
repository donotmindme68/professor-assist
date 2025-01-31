import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  responseContent: text("response_content"),
  citations: text("citations").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionsRelations = relations(questions, ({ many }) => ({
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  question: one(questions, {
    fields: [files.questionId],
    references: [questions.id],
  }),
}));

export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export const insertFileSchema = createInsertSchema(files);
export const selectFileSchema = createSelectSchema(files);

export type InsertQuestion = typeof questions.$inferInsert;
export type SelectQuestion = typeof questions.$inferSelect;
export type InsertFile = typeof files.$inferInsert;
export type SelectFile = typeof files.$inferSelect;
