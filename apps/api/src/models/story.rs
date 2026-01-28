use async_graphql::SimpleObject;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::enums::StoryCategory;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, SimpleObject)]
#[graphql(name = "Story")]
pub struct Story {
    pub id: Uuid,
    pub pantheon_id: Uuid,
    pub title: String,
    pub slug: String,
    pub summary: Option<String>,
    pub full_narrative: Option<String>,
    pub key_excerpts: Option<serde_json::Value>,
    pub category: Option<StoryCategory>,
    pub moral_themes: Option<Vec<String>>,
    pub cultural_significance: Option<String>,
    pub related_festivals: Option<Vec<String>>,
    pub external_links: Option<serde_json::Value>,
    pub citation_sources: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
