import { api, z, databricks } from "@superblocksteam/sdk-api";
import crypto from "node:crypto";

const DATABRICKS_ID = "9fef8212-663a-4719-a004-0c64e8321c0d";

export default api({
  name: "AddReading",
  description: "Inserts a new blood pressure reading for a user",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
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
    id: z.string(),
  }),
  async run(ctx, { userId, systolic, diastolic, pulse, arm, position, notes, readingDate }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await ctx.integrations.databricks_free.execute(
      `INSERT INTO bp_readings (id, user_id, systolic, diastolic, pulse, arm, position, notes, reading_date, created_at)
       VALUES (:PARAM_1, :PARAM_2, :PARAM_3, :PARAM_4, :PARAM_5, :PARAM_6, :PARAM_7, :PARAM_8, :PARAM_9, :PARAM_10)`,
      [
        id,
        userId,
        String(systolic),
        String(diastolic),
        pulse != null ? String(pulse) : null,
        arm,
        position,
        notes,
        readingDate,
        now,
      ],
      { label: "Insert BP reading" }
    );

    return { success: true, id };
  },
});
