import { users } from "@schema/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";

const authRoute = new Hono<{ Bindings: CloudflareBindings }>();




export {authRoute}