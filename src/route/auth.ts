import { users } from "@schema/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import {
  loginValidation,
  signUpValidation,
} from "../validation/authValidation";
import { hashPassword, verifyPassword } from "../utils";
import { eq } from "drizzle-orm";

const authRoute = new Hono<{ Bindings: CloudflareBindings }>();

authRoute
  .post("/sign-up", async (c) => {
    const data = await c.req.json();
    let validate;
    try {
      validate = signUpValidation.parse(data);
    } catch (error) {
      console.log(error);
      return c.json({ message: error }, 403);
    }
    const hashedPassword = await hashPassword(validate.password);
    try {
      const db = drizzle(c.env.DB);
      validate.password = hashedPassword;
      const response = await db.insert(users).values(validate).returning();
      return c.json(response[0], 200);
    } catch (error) {
      console.log(error);
      return c.json({ error }, 500);
    }
  })
  .post("/login", async (c) => {
    const data = await c.req.json();

    // Validate request body
    let validate;
    try {
      validate = loginValidation.parse(data);
    } catch (error) {
      console.error("Validation error:", error);
      return c.json({ message: "Invalid request format" }, 400);
    }

    const db = drizzle(c.env.DB);

    try {
      // Execute the query and await the result
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.phone, data.phone))
        .limit(1)
        .execute();

      if (!existingUser) {
        return c.json({ message: "User not found" }, 404);
      }

      const { password, ...safeUser } = existingUser;
      const verifiedPassword = await verifyPassword(
        password,
        validate.password
      );

      if (!verifiedPassword) {
        return c.json({ message: "Incorrect password" }, 403);
      }

      return c.json({ safeUser, verifiedPassword, password });
    } catch (error) {
      console.error("Database error:", error);
      return c.json({ message: "Authentication failed" }, 500);
    }
  });

export { authRoute };
