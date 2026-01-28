use async_graphql::SimpleObject;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::enums::{ConfidenceLevel, RelationshipType};

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, SimpleObject)]
#[graphql(name = "DeityRelationship")]
pub struct DeityRelationship {
    pub id: Uuid,
    pub from_deity_id: Uuid,
    pub to_deity_id: Uuid,
    pub relationship_type: RelationshipType,
    pub confidence_level: Option<ConfidenceLevel>,
    pub notes: Option<String>,
    pub is_disputed: bool,
    pub dispute_notes: Option<String>,
    pub citation_sources: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeityRelationshipResult {
    pub related_deity_id: Uuid,
    pub relationship: String,
    pub direction: String,
    pub confidence_level: Option<ConfidenceLevel>,
    pub is_disputed: bool,
}
