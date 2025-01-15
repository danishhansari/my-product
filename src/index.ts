import { users } from "@schema/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono changed!");
});

app.get("/users", async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const result = await db.select().from(users).all();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post("/create", async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const result = await db
      .insert(users)
      .values({
        id: uuidv4(),
        name: "Hi there",
        created: new Date(),
      })
      .returning();
    return c.json({ success: true, result });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
