import { api, z, databricks } from "@superblocksteam/sdk-api";

const DATABRICKS_ID = "9fef8212-663a-4719-a004-0c64e8321c0d";

export default api({
  name: "DeleteReading",
  description: "Deletes a blood pressure reading by ID for a user",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
    readingId: z.string(),
    userId: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  async run(ctx, { readingId, userId }) {
    await ctx.integrations.databricks_free.execute(
      "DELETE FROM bp_readings WHERE id = :PARAM_1 AND user_id = :PARAM_2",
      [readingId, userId],
      { label: "Delete BP reading" }
    );

    return { success: true };
  },
});
