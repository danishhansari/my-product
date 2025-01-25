import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    phone: text("phone").notNull(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    shopName: text("shop_name").notNull(),
    category: text("category"),
    isPremium: integer("is_premium", { mode: "boolean" }).default(false),
    purchase_time: integer("purchase_time", { mode: "timestamp" }),
    expires: integer("expires", { mode: "timestamp" }),
    created: text("created").default(sql`(current_timestamp)`),
  },
  (table) => {
    return {
      phoneIndex: index("user_phone_index").on(table.phone),
      shopIndex: index("shop_name_index").on(table.shopName),
    };
  }
);
