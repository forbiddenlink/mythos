use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use async_graphql::SimpleObject;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, SimpleObject)]
pub struct Pantheon {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub culture: String,
    pub region: String,
    pub time_period_start: Option<i32>,
    pub time_period_end: Option<i32>,
    pub description: Option<String>,
    pub citation_sources: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
}
