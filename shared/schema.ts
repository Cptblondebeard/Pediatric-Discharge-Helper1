import { pgTable, text, serial, integer, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dischargeSummaries = pgTable("discharge_summaries", {
  id: serial("id").primaryKey(),
  // Patient Details
  patientName: text("patient_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // Male, Female, Other
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  ipNumber: text("ip_number").notNull(),
  bedNumber: text("bed_number"),
  unitOfAdmission: text("unit_of_admission").notNull(),
  admissionDate: text("admission_date").notNull(), // ISO date string
  dischargeDate: text("discharge_date").notNull(), // ISO date string
  consultantName: text("consultant_name").notNull(),
  
  // Clinical Data
  admittingDiagnosis: text("admitting_diagnosis").notNull(),
  comorbidities: text("comorbidities"),
  dischargeDiagnosis: text("discharge_diagnosis").notNull(),
  complications: text("complications"),
  
  // Investigations (stored as text blocks for now, matching the input style)
  bloodInvestigations: text("blood_investigations"),
  imagingInvestigations: text("imaging_investigations"),
  otherInvestigations: text("other_investigations"),
  
  // Course
  hospitalCourse: text("hospital_course").notNull(),
  
  // Discharge Planning
  dischargeMedications: text("discharge_medications").notNull(),
  ivMedications: text("iv_medications"),
  followUpPlan: text("follow_up_plan").notNull(),
  specialInstructions: text("special_instructions"),
  dischargeCondition: text("discharge_condition").notNull(),
  
  // Generated Content
  generatedSummary: text("generated_summary"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDischargeSummarySchema = createInsertSchema(dischargeSummaries).omit({ 
  id: true, 
  createdAt: true,
  generatedSummary: true 
});

export type DischargeSummary = typeof dischargeSummaries.$inferSelect;
export type InsertDischargeSummary = z.infer<typeof insertDischargeSummarySchema>;

// Request types
export type GenerateSummaryRequest = InsertDischargeSummary;
