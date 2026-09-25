import { api, z, databricks } from "@superblocksteam/sdk-api";
import crypto from "node:crypto";

const DATABRICKS_ID = "9fef8212-663a-4719-a004-0c64e8321c0d";

const LoginUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  password_hash: z.string(),
  password_salt: z.string(),
  display_name: z.string(),
});

export default api({
  name: "Login",
  description: "Authenticates a user by username and password",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
    username: z.string(),
    password: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
    message: z.string(),
    user: z
      .object({
        id: z.string(),
        username: z.string(),
        display_name: z.string(),
      })
      .nullable(),
  }),
  async run(ctx, { username, password }) {
    const users = await ctx.integrations.databricks_free.query(
      "SELECT id, username, password_hash, password_salt, display_name FROM users WHERE LOWER(username) = LOWER(:PARAM_1) LIMIT 1",
      LoginUserSchema,
      [username],
      { label: "Fetch user for login" }
    );

    if (users.length === 0) {
      return { success: false, message: "Invalid username or password", user: null };
    }

    const user = users[0];
    const hash = crypto
      .pbkdf2Sync(password, user.password_salt, 100000, 64, "sha512")
      .toString("hex");

    if (hash !== user.password_hash) {
      return { success: false, message: "Invalid username or password", user: null };
    }

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
      },
    };
  },
});
