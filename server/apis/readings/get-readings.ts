import { api, z, databricks } from "@superblocksteam/sdk-api";

const DATABRICKS_ID = "9fef8212-663a-4719-a004-0c64e8321c0d";

const ReadingSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  systolic: z.coerce.number(),
  diastolic: z.coerce.number(),
  pulse: z.coerce.number().nullable(),
  arm: z.string().nullable(),
  position: z.string().nullable(),
  notes: z.string().nullable(),
  reading_date: z.string(),
  created_at: z.string(),
});

export type Reading = z.infer<typeof ReadingSchema>;

export default api({
  name: "GetReadings",
  description: "Fetches paginated readings, filtered by search and date",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
    userId: z.string(),
    search: z.string().nullable(),
    // ISO timestamps; null means no bound on that side
    fromDate: z.string().nullable(),
    toDate: z.string().nullable(),
    limit: z.number(),
    offset: z.number(),
  }),
  output: z.object({
    readings: z.array(ReadingSchema),
    total: z.coerce.number(),
  }),
  async run(ctx, { userId, search, fromDate, toDate, limit, offset }) {
    const conditions = ["user_id = :PARAM_1"];
    const params: string[] = [userId];

    const term = search?.trim();
    if (term) {
      params.push(`%${term}%`);
      const p = `:PARAM_${params.length}`;
      conditions.push(
        `(LOWER(notes) LIKE LOWER(${p}) OR LOWER(arm) LIKE LOWER(${p}) OR LOWER(position) LIKE LOWER(${p}))`
      );
    }
    if (fromDate) {
      params.push(fromDate);
      conditions.push(`reading_date >= CAST(:PARAM_${params.length} AS TIMESTAMP)`);
    }
    if (toDate) {
      params.push(toDate);
      conditions.push(`reading_date <= CAST(:PARAM_${params.length} AS TIMESTAMP)`);
    }
    const where = conditions.join(" AND ");

    // Databricks doesn't accept parameterized LIMIT/OFFSET, so clamp and inline them
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const safeOffset = Math.max(0, Math.floor(offset));

    const [countResult, readings] = await Promise.all([
      ctx.integrations.databricks_free.query(
        `SELECT COUNT(*) as cnt FROM bp_readings WHERE ${where}`,
        z.object({ cnt: z.coerce.number() }),
        params,
        { label: "Count readings" }
      ),
      ctx.integrations.databricks_free.query(
        `SELECT id, user_id, systolic, diastolic, pulse, arm, position, notes, reading_date, created_at
         FROM bp_readings WHERE ${where}
         ORDER BY reading_date DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        ReadingSchema,
        params,
        { label: "Fetch readings page" }
      ),
    ]);

    return {
      readings,
      total: countResult[0]?.cnt ?? 0,
    };
  },
});
