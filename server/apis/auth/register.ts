import { api, z, databricks } from "@superblocksteam/sdk-api";
import crypto from "node:crypto";

const DATABRICKS_ID = "9fef8212-663a-4719-a004-0c64e8321c0d";

const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string(),
  created_at: z.string(),
});

export default api({
  name: "Register",
  description: "Registers a new user with hashed password",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
    username: z.string(),
    password: z.string(),
    displayName: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
    message: z.string(),
    user: UserSchema.nullable(),
  }),
  async run(ctx, { username, password, displayName }) {
    // Check if username already exists
    const existing = await ctx.integrations.databricks_free.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(:PARAM_1) LIMIT 1",
      z.object({ id: z.string() }),
      [username],
      { label: "Check existing user" }
    );

    if (existing.length > 0) {
      return { success: false, message: "Username already taken", user: null };
    }

    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    const now = new Date().toISOString();

    await ctx.integrations.databricks_free.execute(
      "INSERT INTO users (id, username, password_hash, password_salt, display_name, created_at) VALUES (:PARAM_1, :PARAM_2, :PARAM_3, :PARAM_4, :PARAM_5, :PARAM_6)",
      [id, username, hash, salt, displayName, now],
      { label: "Insert new user" }
    );

    return {
      success: true,
      message: "Registration successful",
      user: { id, username, display_name: displayName, created_at: now },
    };
  },
});
