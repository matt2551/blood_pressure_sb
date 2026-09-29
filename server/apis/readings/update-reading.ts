import { api, z, databricks } from "@superblocksteam/sdk-api";

const DATABRICKS_ID = "9fef8212-663a-4719-a004-0c64e8321c0d";

export default api({
  name: "UpdateReading",
  description: "Updates an existing blood pressure reading",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
    readingId: z.string(),
    userId: z.string(),
    systolic: z.number(),
    diastolic: z.number(),
    pulse: z.number().nullable(),
    arm: z.string().nullable(),
    position: z.string().nullable(),
    notes: z.string().nullable(),
    readingDate: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  async run(ctx, { readingId, userId, systolic, diastolic, pulse, arm, position, notes, readingDate }) {
    await ctx.integrations.databricks_free.execute(
      `UPDATE bp_readings
       SET systolic = :PARAM_1,
           diastolic = :PARAM_2,
           pulse = :PARAM_3,
           arm = :PARAM_4,
           position = :PARAM_5,
           notes = :PARAM_6,
           reading_date = :PARAM_7
       WHERE id = :PARAM_8 AND user_id = :PARAM_9`,
      [
        String(systolic),
        String(diastolic),
        pulse != null ? String(pulse) : null,
        arm,
        position,
        notes,
        readingDate,
        readingId,
        userId,
      ],
      { label: "Update BP reading" }
    );

    return { success: true };
  },
});
