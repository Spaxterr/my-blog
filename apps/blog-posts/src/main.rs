mod auth;
mod handlers;
mod secrets;
mod services;
mod validation;

use axum::{
    Router, middleware,
    routing::{get, post},
};
use sqlx::{PgPool, postgres::PgPoolOptions};

use crate::{auth::AuthClient, secrets::read_secret};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let db_url = read_secret("DATABASE_URL").expect("DATABASE_URL is not set");
    let host = read_secret("HOST").expect("HOST is not set");
    let auth_server_host = read_secret("AUTH_HOST").expect("AUTH_HOST is not set");

    let auth_client = AuthClient::new(auth_server_host);

    println!("Connecting to Postgres...");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await
        .expect("Failed to connect to Postgres");

    println!("Running migrations...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    println!("Registering routes...");

    let admin_routes: Router<PgPool> = Router::new()
        .route("/posts", post(handlers::posts::create_post_handler))
        .route("/tags", post(handlers::tags::create_tag_handler))
        .route_layer(middleware::from_fn_with_state(
            auth_client,
            auth::require_admin,
        ));

    let app = Router::new()
        .route("/posts", get(handlers::posts::get_all_posts_handler))
        .route("/posts/{id}", get(handlers::posts::get_post_handler))
        .route("/tags", get(handlers::tags::get_all_tags_handler))
        .route("/docs", get(handlers::docs::docs_handler))
        .route("/openapi.json", get(handlers::docs::openapi_handler))
        .merge(admin_routes)
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind(&host)
        .await
        .unwrap_or_else(|_| panic!("Unable to bind to host address {host}"));

    println!("Listening on 0.0.0.0:3000");
    axum::serve(listener, app)
        .await
        .expect("Could not start Axum instance");
}
