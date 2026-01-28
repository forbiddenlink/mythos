use axum::{
    routing::get,
    Router,
};
use async_graphql_axum::GraphQL;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod db;
mod graphql;
mod models;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "mythos_atlas_api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables
    dotenvy::dotenv().ok();
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");

    // Create database connection pool
    tracing::info!("📊 Connecting to database...");
    let pool = db::create_pool(&database_url)
        .await
        .expect("Failed to create database pool");
    tracing::info!("✅ Database connection pool established");

    // Build GraphQL schema
    let schema = graphql::build_schema(pool);
    tracing::info!("🔷 GraphQL schema built");

    // Build GraphQL service
    let graphql_service = GraphQL::new(schema);

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build our application with a route
    let app = Router::new()
        .route("/health", get(health_check))
        .route_service("/graphql", graphql_service)
        .layer(cors);

    // Run it
    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    tracing::info!("🏛️ Mythos Atlas API listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "Mythos Atlas API is running! 🏛️"
}
