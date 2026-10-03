use axum::extract::Path;
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
            tracing::error!("Failed to create tag: {e}");
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to create tag".to_owned(),
            ));
        }
    };
}

pub async fn get_tag_handler(
    State(pool): State<PgPool>,
    Path(id): Path<uuid::Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    return match tags::get_tag(&pool, &id).await {
        Ok(tag) => tag.map_or(Err(StatusCode::NOT_FOUND), |t| return Ok(Json(t))),
        Err(e) => {
            tracing::error!("Failed to get tag: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
}

pub async fn delete_tag_handler(
    State(pool): State<PgPool>,
    Path(id): Path<uuid::Uuid>,
) -> Result<StatusCode, StatusCode> {
    return match tags::delete_tag(&pool, &id).await {
        Ok(()) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            tracing::error!("Failed to delete tag: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
}

pub async fn get_all_tags_handler(
    State(pool): State<PgPool>,
) -> Result<impl IntoResponse, StatusCode> {
    return match tags::get_all_tags(&pool).await {
        Ok(tags) => Ok(Json(tags)),
        Err(e) => {
            tracing::error!("Failed to get tags: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
}
