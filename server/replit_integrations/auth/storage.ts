import { users, type User } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getOrCreateUser(data: { id: string; email: string; name: string }): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getOrCreateUser(data: { id: string; email: string; name: string }): Promise<User> {
    const existing = await this.getUser(data.id);
    if (existing) return existing;

    const nameParts = data.name.trim().split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || null;

    const [user] = await db
      .insert(users)
      .values({
        id: data.id,
        email: data.email,
        firstName,
        lastName: lastName ?? undefined,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: data.email,
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
