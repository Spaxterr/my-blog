use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use blog_contracts::models::{CreatePostPayload, PostContentType, Theme};
use serde::Deserialize;
use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

use crate::services::{blog, markdown::to_html};
use crate::validation;

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
}

#[derive(Deserialize)]
pub struct GetPostQuery {
    pub content_type: PostContentType,
    pub theme: Theme,
}

pub async fn create_post_handler(
    State(pool): State<PgPool>,
    Json(body): Json<Value>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    validation::check(&validation::CREATE_POST_PAYLOAD, &body)
        .map_err(|message| return (StatusCode::BAD_REQUEST, message))?;

    let payload: CreatePostPayload = serde_json::from_value(body)
        .map_err(|e| return (StatusCode::BAD_REQUEST, e.to_string()))?;

    return match blog::create_post(&pool, &payload).await {
        Ok(()) => Ok(StatusCode::CREATED),
        Err(e) => {
            eprint!("Failed to create post: {e}");
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to create post".to_owned(),
            ));
        }
    };
}

pub async fn get_post_handler(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Query(query): Query<GetPostQuery>,
) -> Result<impl IntoResponse, StatusCode> {
    let mut blog_post = match blog::get_post(&pool, &id).await {
        Ok(result) => match result {
            Some(post) => post,
            None => return Err(StatusCode::NOT_FOUND),
        },
        Err(e) => {
            eprint!("Failed to get blog post: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let content: String = match query.content_type {
        PostContentType::Html => to_html(&blog_post.content, query.theme),
        PostContentType::Markdown => {
            // Already markdown, no need to do anything
            blog_post.content
        }
    };

    blog_post.content = content;

    return Ok(Json(blog_post));
}

pub async fn get_all_posts_handler(
    State(pool): State<PgPool>,
    Query(q): Query<SearchQuery>,
) -> Result<impl IntoResponse, StatusCode> {
    match q.q {
        Some(search_term) => {
            return match blog::search_posts(&pool, &search_term).await {
                Ok(result) => Ok(Json(result)),
                Err(e) => {
                    eprint!("Failed to get all blog posts: {e}");
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
            };
        }
        None => {
            return match blog::get_all_posts(&pool).await {
                Ok(result) => Ok(Json(result)),
                Err(e) => {
                    eprint!("Failed to get all blog posts: {e}");
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
            };
        }
    }
}
