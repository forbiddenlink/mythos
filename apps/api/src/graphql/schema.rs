use async_graphql::{EmptyMutation, EmptySubscription, Schema};
use sqlx::PgPool;

use super::query::QueryRoot;

pub type MythosSchema = Schema<QueryRoot, EmptyMutation, EmptySubscription>;

pub fn build_schema(pool: PgPool) -> MythosSchema {
    Schema::build(QueryRoot, EmptyMutation, EmptySubscription)
        .data(pool)
        .finish()
}
