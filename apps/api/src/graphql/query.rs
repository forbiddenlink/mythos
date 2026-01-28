use async_graphql::{Context, Object, Result};
use sqlx::PgPool;

use crate::models::{Deity, DeityRelationship, Event, Location, Pantheon, Story};

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    /// Get all pantheons
    async fn pantheons(&self, ctx: &Context<'_>) -> Result<Vec<Pantheon>> {
        let pool = ctx.data::<PgPool>()?;
        
        let pantheons = sqlx::query_as::<_, Pantheon>(
            "SELECT * FROM pantheons ORDER BY name"
        )
        .fetch_all(pool)
        .await?;
        
        Ok(pantheons)
    }
    
    /// Get a specific pantheon by ID
    async fn pantheon(&self, ctx: &Context<'_>, id: String) -> Result<Option<Pantheon>> {
        let pool = ctx.data::<PgPool>()?;
        let uuid = uuid::Uuid::parse_str(&id)?;
        
        let pantheon = sqlx::query_as::<_, Pantheon>(
            "SELECT * FROM pantheons WHERE id = $1"
        )
        .bind(uuid)
        .fetch_optional(pool)
        .await?;
        
        Ok(pantheon)
    }
    
    /// Get all deities, optionally filtered by pantheon
    async fn deities(
        &self,
        ctx: &Context<'_>,
        pantheon_id: Option<String>,
    ) -> Result<Vec<Deity>> {
        let pool = ctx.data::<PgPool>()?;
        
        let deities = if let Some(pid) = pantheon_id {
            let uuid = uuid::Uuid::parse_str(&pid)?;
            sqlx::query_as::<_, Deity>(
                "SELECT * FROM deities WHERE pantheon_id = $1 ORDER BY importance_rank NULLS LAST, name"
            )
            .bind(uuid)
            .fetch_all(pool)
            .await?
        } else {
            sqlx::query_as::<_, Deity>(
                "SELECT * FROM deities ORDER BY importance_rank NULLS LAST, name LIMIT 100"
            )
            .fetch_all(pool)
            .await?
        };
        
        Ok(deities)
    }
    
    /// Get a specific deity by ID
    async fn deity(&self, ctx: &Context<'_>, id: String) -> Result<Option<Deity>> {
        let pool = ctx.data::<PgPool>()?;
        let uuid = uuid::Uuid::parse_str(&id)?;
        
        let deity = sqlx::query_as::<_, Deity>(
            "SELECT * FROM deities WHERE id = $1"
        )
        .bind(uuid)
        .fetch_optional(pool)
        .await?;
        
        Ok(deity)
    }

    /// Get relationships for a specific deity
    async fn deity_relationships(
        &self,
        ctx: &Context<'_>,
        deity_id: String,
    ) -> Result<Vec<DeityRelationship>> {
        let pool = ctx.data::<PgPool>()?;
        let uuid = uuid::Uuid::parse_str(&deity_id)?;
        
        let relationships = sqlx::query_as::<_, DeityRelationship>(
            "SELECT * FROM deity_relationships 
             WHERE from_deity_id = $1 OR to_deity_id = $1 
             ORDER BY relationship_type"
        )
        .bind(uuid)
        .fetch_all(pool)
        .await?;
        
        Ok(relationships)
    }

    /// Get all relationships, optionally filtered by pantheon
    async fn all_relationships(
        &self,
        ctx: &Context<'_>,
        pantheon_id: Option<String>,
    ) -> Result<Vec<DeityRelationship>> {
        let pool = ctx.data::<PgPool>()?;
        
        let relationships = if let Some(pid) = pantheon_id {
            let uuid = uuid::Uuid::parse_str(&pid)?;
            sqlx::query_as::<_, DeityRelationship>(
                "SELECT dr.* FROM deity_relationships dr
                 INNER JOIN deities d ON dr.from_deity_id = d.id
                 WHERE d.pantheon_id = $1
                 ORDER BY dr.relationship_type"
            )
            .bind(uuid)
            .fetch_all(pool)
            .await?
        } else {
            sqlx::query_as::<_, DeityRelationship>(
                "SELECT * FROM deity_relationships 
                 ORDER BY relationship_type 
                 LIMIT 200"
            )
            .fetch_all(pool)
            .await?
        };
        
        Ok(relationships)
    }

    /// Get all stories, optionally filtered by pantheon
    async fn stories(
        &self,
        ctx: &Context<'_>,
        pantheon_id: Option<String>,
    ) -> Result<Vec<Story>> {
        let pool = ctx.data::<PgPool>()?;
        
        let stories = if let Some(pid) = pantheon_id {
            let uuid = uuid::Uuid::parse_str(&pid)?;
            sqlx::query_as::<_, Story>(
                "SELECT * FROM stories WHERE pantheon_id = $1 ORDER BY title"
            )
            .bind(uuid)
            .fetch_all(pool)
            .await?
        } else {
            sqlx::query_as::<_, Story>(
                "SELECT * FROM stories ORDER BY title LIMIT 100"
            )
            .fetch_all(pool)
            .await?
        };
        
        Ok(stories)
    }

    /// Get a specific story by ID
    async fn story(&self, ctx: &Context<'_>, id: String) -> Result<Option<Story>> {
        let pool = ctx.data::<PgPool>()?;
        let uuid = uuid::Uuid::parse_str(&id)?;
        
        let story = sqlx::query_as::<_, Story>(
            "SELECT * FROM stories WHERE id = $1"
        )
        .bind(uuid)
        .fetch_optional(pool)
        .await?;
        
        Ok(story)
    }

    /// Get events, optionally filtered by story
    async fn events(
        &self,
        ctx: &Context<'_>,
        story_id: Option<String>,
    ) -> Result<Vec<Event>> {
        let pool = ctx.data::<PgPool>()?;
        
        let events = if let Some(sid) = story_id {
            let uuid = uuid::Uuid::parse_str(&sid)?;
            sqlx::query_as::<_, Event>(
                "SELECT * FROM events WHERE story_id = $1 ORDER BY sequence_order NULLS LAST, title"
            )
            .bind(uuid)
            .fetch_all(pool)
            .await?
        } else {
            sqlx::query_as::<_, Event>(
                "SELECT * FROM events ORDER BY sequence_order NULLS LAST, title LIMIT 100"
            )
            .fetch_all(pool)
            .await?
        };
        
        Ok(events)
    }

    /// Get locations, optionally filtered by pantheon
    async fn locations(
        &self,
        ctx: &Context<'_>,
        pantheon_id: Option<String>,
    ) -> Result<Vec<Location>> {
        let pool = ctx.data::<PgPool>()?;
        
        let locations = if let Some(pid) = pantheon_id {
            let uuid = uuid::Uuid::parse_str(&pid)?;
            sqlx::query_as::<_, Location>(
                "SELECT * FROM locations WHERE pantheon_id = $1 ORDER BY name"
            )
            .bind(uuid)
            .fetch_all(pool)
            .await?
        } else {
            sqlx::query_as::<_, Location>(
                "SELECT * FROM locations ORDER BY name LIMIT 100"
            )
            .fetch_all(pool)
            .await?
        };
        
        Ok(locations)
    }

    /// Get a specific location by ID
    async fn location(&self, ctx: &Context<'_>, id: String) -> Result<Option<Location>> {
        let pool = ctx.data::<PgPool>()?;
        let uuid = uuid::Uuid::parse_str(&id)?;
        
        let location = sqlx::query_as::<_, Location>(
            "SELECT * FROM locations WHERE id = $1"
        )
        .bind(uuid)
        .fetch_optional(pool)
        .await?;
        
        Ok(location)
    }

    /// Search across deities, stories, and pantheons
    async fn search(
        &self,
        ctx: &Context<'_>,
        query: String,
        #[graphql(desc = "Limit results per entity type")] limit: Option<i32>,
    ) -> Result<SearchResults> {
        let pool = ctx.data::<PgPool>()?;
        let search_limit = limit.unwrap_or(10) as i64;
        let search_pattern = format!("%{}%", query);
        
        // Search deities
        let deities = sqlx::query_as::<_, Deity>(
            "SELECT * FROM deities 
             WHERE name ILIKE $1 
                OR alternate_names_text ILIKE $1
                OR description ILIKE $1
             ORDER BY importance_rank NULLS LAST
             LIMIT $2"
        )
        .bind(&search_pattern)
        .bind(search_limit)
        .fetch_all(pool)
        .await?;

        // Search pantheons
        let pantheons = sqlx::query_as::<_, Pantheon>(
            "SELECT * FROM pantheons 
             WHERE name ILIKE $1 
                OR culture ILIKE $1
                OR description ILIKE $1
             ORDER BY name
             LIMIT $2"
        )
        .bind(&search_pattern)
        .bind(search_limit)
        .fetch_all(pool)
        .await?;

        // Search stories
        let stories = sqlx::query_as::<_, Story>(
            "SELECT * FROM stories 
             WHERE title ILIKE $1 
                OR summary ILIKE $1
             ORDER BY title
             LIMIT $2"
        )
        .bind(&search_pattern)
        .bind(search_limit)
        .fetch_all(pool)
        .await?;
        
        Ok(SearchResults {
            deities,
            pantheons,
            stories,
        })
    }
}

#[derive(async_graphql::SimpleObject)]
pub struct SearchResults {
    pub deities: Vec<Deity>,
    pub pantheons: Vec<Pantheon>,
    pub stories: Vec<Story>,
}
