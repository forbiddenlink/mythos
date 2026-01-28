use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use async_graphql::SimpleObject;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, SimpleObject)]
pub struct Deity {
    pub id: Uuid,
    pub pantheon_id: Uuid,
    pub name: String,
    pub slug: String,
    pub alternate_names: Option<Vec<String>>,
    pub alternate_names_text: Option<String>,
    pub gender: Option<String>,
    pub domain: Option<Vec<String>>,
    pub symbols: Option<Vec<String>>,
    pub description: Option<String>,
    pub origin_story: Option<String>,
    pub importance_rank: Option<i32>,
    pub image_url: Option<String>,
    pub citation_sources: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
