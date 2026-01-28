use async_graphql::SimpleObject;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::enums::EventType;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, SimpleObject)]
#[graphql(name = "Event")]
pub struct Event {
    pub id: Uuid,
    pub story_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub event_type: Option<EventType>,
    pub sequence_order: Option<i32>,
    pub mythological_era: Option<String>,
    pub citation_sources: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
