import { users, type User } from "@shared/models/auth";
import { db } from "../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getOrCreateUser(data: { id: string; email: string; name: string }): Promise<User>;
  upsertUser(user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  }): Promise<User>;
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

    return this.upsertUser({
      id: data.id,
      email: data.email,
      firstName,
      lastName,
      profileImageUrl: null,
    });
  }

  async upsertUser(user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  }): Promise<User> {
    const [upserted] = await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }
}


class MockAuthStorage implements IAuthStorage {
  private users: Map<string, User> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getOrCreateUser(data: { id: string; email: string; name: string }): Promise<User> {
    const existing = await this.getUser(data.id);
    if (existing) return existing;

    const nameParts = data.name.trim().split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || null;

    return this.upsertUser({
      id: data.id,
      email: data.email,
      firstName,
      lastName,
      profileImageUrl: null,
    });
  }

  async upsertUser(user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  }): Promise<User> {
    const existing = this.users.get(user.id);
    const updated: User = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      bio: existing?.bio ?? null,
      city: existing?.city ?? null,
      interests: existing?.interests ?? null,
      role: existing?.role ?? "user",
      quizCompleted: existing?.quizCompleted ?? false,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, updated);
    return updated;
  }
}

export const authStorage = process.env.DATABASE_URL ? new AuthStorage() : new MockAuthStorage();
