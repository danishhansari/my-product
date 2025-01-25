import { users } from "@schema/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { authRoute } from "./route/auth";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", logger());

app.get("/", (c) => {
  return c.text("Hello Hono changed!");
});

app.get("/users", async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const result = await db.select().from(users).all();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error }, 500);
  }
});

app.route("/auth", authRoute);

export default app;
