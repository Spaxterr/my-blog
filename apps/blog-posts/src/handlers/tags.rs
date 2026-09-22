use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use blog_contracts::models::CreateTagPayload;
use serde_json::Value;
use sqlx::PgPool;

use crate::services::tags;
use crate::validation;

pub async fn create_tag_handler(
    State(pool): State<PgPool>,
    Json(body): Json<Value>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    validation::check(&validation::CREATE_TAG_PAYLOAD, &body)
        .map_err(|message| return (StatusCode::BAD_REQUEST, message))?;

    let mut payload: CreateTagPayload = serde_json::from_value(body)
        .map_err(|e| return (StatusCode::BAD_REQUEST, e.to_string()))?;

    // Tags are always lowercase.
    payload.label = payload.label.to_lowercase();

    return match tags::create_tag(&pool, &payload).await {
        Ok(()) => Ok(StatusCode::CREATED),
        Err(e) => {
            eprintln!("Failed to create tag: {e}");
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to create tag".to_owned(),
            ));
        }
    };
}

pub async fn get_all_tags_handler(
    State(pool): State<PgPool>,
) -> Result<impl IntoResponse, StatusCode> {
    return match tags::get_all_tags(&pool).await {
        Ok(tags) => Ok(Json(tags)),
        Err(e) => {
            eprintln!("Failed to get tags: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
}
