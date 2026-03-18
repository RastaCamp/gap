/**
 * Per-provider mappers: raw -> UnifiedRecord.
 * Contract: stable source, source_id; normalize location/time; assign severity, tags, category.
 * Keep adapter (fetch) logic in each project; use mappers when building risk_score / geo / cross-source views.
 */

export * from "./base";
export * from "./airnow";
export * from "./usgs_quake";
export * from "./envirofacts_water";
export * from "./baltimore_crime";
