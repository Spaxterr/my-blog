use axum::extract::Path;
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use sqlx::PgPool;

use crate::services::categories;

pub async fn get_all_categories_handler(
    State(pool): State<PgPool>,
) -> Result<impl IntoResponse, StatusCode> {
    return match categories::get_all_categories(&pool).await {
        Ok(categories) => Ok(Json(categories)),
        Err(e) => {
            eprintln!("Failed to get categories: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
}

pub async fn delete_category_handler(
    State(pool): State<PgPool>,
    Path(id): Path<uuid::Uuid>,
) -> Result<StatusCode, StatusCode> {
    return match categories::delete_category(&pool, &id).await {
        Ok(()) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            eprintln!("Failed to delete category: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
}
