import { api, z, databricks } from "@superblocksteam/sdk-api";

const DATABRICKS_ID = "9fef8212-663a-4719-a004-0c64e8321c0d";

// Safety cap so a very long "All time" report can't pull an unbounded result set
const MAX_ROWS = 1000;

const ReportReadingSchema = z.object({
  id: z.string(),
  systolic: z.coerce.number(),
  diastolic: z.coerce.number(),
  pulse: z.coerce.number().nullable(),
  arm: z.string().nullable(),
  position: z.string().nullable(),
  notes: z.string().nullable(),
  reading_date: z.string(),
});

export default api({
  name: "GetReportReadings",
  description: "Fetches all of a user's readings in a date range",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
    userId: z.string(),
    // ISO timestamps; null means no bound on that side
    fromDate: z.string().nullable(),
    toDate: z.string().nullable(),
  }),
  output: z.object({
    readings: z.array(ReportReadingSchema),
    truncated: z.boolean(),
  }),
  async run(ctx, { userId, fromDate, toDate }) {
    const conditions = ["user_id = :PARAM_1"];
    const params: string[] = [userId];

    if (fromDate) {
      params.push(fromDate);
      conditions.push(`reading_date >= CAST(:PARAM_${params.length} AS TIMESTAMP)`);
    }
    if (toDate) {
      params.push(toDate);
      conditions.push(`reading_date <= CAST(:PARAM_${params.length} AS TIMESTAMP)`);
    }

    // Fetch one extra row to detect whether the cap was hit
    const rows = await ctx.integrations.databricks_free.query(
      `SELECT id, systolic, diastolic, pulse, arm, position, notes, reading_date
       FROM bp_readings
       WHERE ${conditions.join(" AND ")}
       ORDER BY reading_date ASC
       LIMIT ${MAX_ROWS + 1}`,
      ReportReadingSchema,
      params,
      { label: "Fetch report readings" }
    );

    return {
      readings: rows.slice(0, MAX_ROWS),
      truncated: rows.length > MAX_ROWS,
    };
  },
});
