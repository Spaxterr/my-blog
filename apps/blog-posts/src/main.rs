mod handlers;
mod services;

use axum::{
    Router,
    routing::{get, post},
};
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load env vars");

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let host = std::env::var("HOST").expect("HOST must be set");

    println!("Connecting to Postgres...");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await
        .expect("Failed to connect to Postgres");

    println!("Registering routes...");
    let app = Router::new()
        .route("/posts", get(handlers::posts::get_all_posts_handler))
        .route("/posts", post(handlers::posts::create_post_handler))
        .route("/posts/{id}", get(handlers::posts::get_post_handler))
        .route("/docs", get(handlers::docs::docs_handler))
        .route("/openapi.yaml", get(handlers::docs::openapi_handler))
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind(&host)
        .await
        .unwrap_or_else(|_| panic!("Unable to bind to host address {host}"));

    println!("Listening on 0.0.0.0:3000");
    axum::serve(listener, app)
        .await
        .expect("Could not start Axum instance");
}
