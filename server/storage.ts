import { db } from "./db";
import { dischargeSummaries, type InsertDischargeSummary, type DischargeSummary } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createDischargeSummary(summary: InsertDischargeSummary): Promise<DischargeSummary>;
  getDischargeSummary(id: number): Promise<DischargeSummary | undefined>;
  getAllDischargeSummaries(): Promise<DischargeSummary[]>;
}

export class DatabaseStorage implements IStorage {
  async createDischargeSummary(summary: InsertDischargeSummary): Promise<DischargeSummary> {
    const [newSummary] = await db.insert(dischargeSummaries).values(summary).returning();
    return newSummary;
  }

  async getDischargeSummary(id: number): Promise<DischargeSummary | undefined> {
    const [summary] = await db.select().from(dischargeSummaries).where(eq(dischargeSummaries.id, id));
    return summary;
  }

  async getAllDischargeSummaries(): Promise<DischargeSummary[]> {
    return db.select().from(dischargeSummaries).orderBy(desc(dischargeSummaries.createdAt));
  }
}

export const storage = new DatabaseStorage();
