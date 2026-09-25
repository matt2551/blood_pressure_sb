import { api, z, databricks } from "@superblocksteam/sdk-api";

const DATABRICKS_ID = "9fef8212-663a-4719-a004-0c64e8321c0d";

const ChartReadingSchema = z.object({
  reading_date: z.string(),
  systolic: z.coerce.number(),
  diastolic: z.coerce.number(),
  pulse: z.coerce.number().nullable(),
});

export default api({
  name: "GetChartData",
  description: "Fetches recent BP readings for trend chart display",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
    userId: z.string(),
  }),
  output: z.object({
    readings: z.array(ChartReadingSchema),
  }),
  async run(ctx, { userId }) {
    const readings = await ctx.integrations.databricks_free.query(
      `SELECT reading_date, systolic, diastolic, pulse
       FROM bp_readings
       WHERE user_id = :PARAM_1
       ORDER BY reading_date DESC
       LIMIT 30`,
      ChartReadingSchema,
      [userId],
      { label: "Fetch chart data" }
    );

    // Return in chronological order for the chart
    return { readings: readings.reverse() };
  },
});
