use async_graphql::{SimpleObject, ComplexObject};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::enums::LocationType;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, SimpleObject)]
#[graphql(name = "Location", complex)]
pub struct Location {
    pub id: Uuid,
    pub name: String,
    pub location_type: Option<LocationType>,
    pub pantheon_id: Option<Uuid>,
    pub description: Option<String>,
    #[graphql(skip)]
    pub latitude: Option<rust_decimal::Decimal>,
    #[graphql(skip)]
    pub longitude: Option<rust_decimal::Decimal>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[ComplexObject]
impl Location {
    async fn latitude(&self) -> Option<String> {
        self.latitude.map(|d| d.to_string())
    }

    async fn longitude(&self) -> Option<String> {
        self.longitude.map(|d| d.to_string())
    }
}
