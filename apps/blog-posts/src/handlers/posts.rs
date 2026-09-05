use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use blog_contracts::models::{CreatePostPayload, PostContentType, Theme};
use serde::Deserialize;
use sqlx::PgPool;

use crate::services::{blog, markdown::to_html};

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
    Json(payload): Json<CreatePostPayload>,
) -> Result<impl IntoResponse, StatusCode> {
    return match blog::create_post(&pool, &payload).await {
        Ok(()) => Ok(StatusCode::CREATED),
        Err(e) => {
            eprint!("Failed to create post: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
}

pub async fn get_post_handler(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
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
