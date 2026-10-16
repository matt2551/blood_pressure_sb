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
  description: "Fetches paginated blood pressure readings for a user",
  integrations: {
    databricks_free: databricks(DATABRICKS_ID),
  },
  input: z.object({
    userId: z.string(),
    search: z.string().nullable(),
    limit: z.number(),
    offset: z.number(),
  }),
  output: z.object({
    readings: z.array(ReadingSchema),
    total: z.coerce.number(),
  }),
  async run(ctx, { userId, search, limit, offset }) {
    const countSchema = z.object({ cnt: z.coerce.number() });
    const hasSearch = search != null && search.trim().length > 0;

    // Count query
    const countSql = hasSearch
      ? "SELECT COUNT(*) as cnt FROM bp_readings WHERE user_id = :PARAM_1 AND (LOWER(notes) LIKE LOWER(:PARAM_2) OR LOWER(arm) LIKE LOWER(:PARAM_2) OR LOWER(position) LIKE LOWER(:PARAM_2))"
      : "SELECT COUNT(*) as cnt FROM bp_readings WHERE user_id = :PARAM_1";
    const countParams = hasSearch ? [userId, `%${search!.trim()}%`] : [userId];

    // Data query — embed limit/offset directly since Databricks may not support parameterized LIMIT
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const safeOffset = Math.max(0, Math.floor(offset));

    const dataSql = hasSearch
      ? `SELECT id, user_id, systolic, diastolic, pulse, arm, position, notes, reading_date, created_at
         FROM bp_readings WHERE user_id = :PARAM_1
         AND (LOWER(notes) LIKE LOWER(:PARAM_2) OR LOWER(arm) LIKE LOWER(:PARAM_2) OR LOWER(position) LIKE LOWER(:PARAM_2))
         ORDER BY reading_date DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
      : `SELECT id, user_id, systolic, diastolic, pulse, arm, position, notes, reading_date, created_at
         FROM bp_readings WHERE user_id = :PARAM_1
         ORDER BY reading_date DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    const dataParams = hasSearch ? [userId, `%${search!.trim()}%`] : [userId];

    const [countResult, readings] = await Promise.all([
      ctx.integrations.databricks_free.query(countSql, countSchema, countParams, { label: "Count readings" }),
      ctx.integrations.databricks_free.query(dataSql, ReadingSchema, dataParams, { label: "Fetch readings page" }),
    ]);

    return {
      readings,
      total: countResult[0]?.cnt ?? 0,
    };
  },
});
