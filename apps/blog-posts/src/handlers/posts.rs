use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use blog_contracts::models::{CreatePostPayload, PostContentType, TagMatchMode, Theme};
use serde::Deserialize;
use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

use crate::services::{blog, markdown::to_html};
use crate::validation;

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
    pub categories: Option<String>,
    pub tags: Option<String>,
    pub tag_mode: Option<TagMatchMode>,
    pub page: Option<i32>,
    pub count: Option<i32>,
}

/// Parses a comma-separated list of UUIDs, dropping duplicates.
fn parse_uuid_list(csv: Option<&str>) -> Result<Vec<Uuid>, (StatusCode, String)> {
    let mut ids = csv
        .unwrap_or_default()
        .split(',')
        .map(str::trim)
        .filter(|s| return !s.is_empty())
        .map(|s| {
            return Uuid::parse_str(s)
                .map_err(|_| return (StatusCode::BAD_REQUEST, format!("Invalid UUID: {s}")));
        })
        .collect::<Result<Vec<_>, _>>()?;
    ids.sort_unstable();
    ids.dedup();

    return Ok(ids);
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
            tracing::error!("Failed to create post: {e}");
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to create post".to_owned(),
            ));
        }
    };
}

pub async fn delete_post_handler(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    return match blog::delete_post(&pool, &id).await {
        Ok(()) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            tracing::error!("Failed to delete post: {e}");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
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
            tracing::error!("Failed to get blog post: {e}");
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
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let page = q.page.unwrap_or(1);
    let count = q.count.unwrap_or(20);

    if page < 1 {
        return Err((
            StatusCode::BAD_REQUEST,
            "page must be at least 1".to_owned(),
        ));
    }
    if !(1..=100).contains(&count) {
        return Err((
            StatusCode::BAD_REQUEST,
            "count must be between 1 and 100".to_owned(),
        ));
    }

    let filter = blog::PostFilter {
        search: q
            .q
            .map(|s| return s.trim().to_owned())
            .filter(|s| return !s.is_empty()),
        categories: parse_uuid_list(q.categories.as_deref())?,
        tags: parse_uuid_list(q.tags.as_deref())?,
        match_all_tags: q.tag_mode == Some(TagMatchMode::All),
    };

    let res = tokio::try_join!(
        blog::list_posts(&pool, &filter, page, count),
        blog::count_posts(&pool, &filter)
    );

    match res {
        Ok((posts, total)) => {
            return Ok(([("X-Total-Posts", total.to_string())], Json(posts)));
        }
        Err(e) => {
            tracing::error!("Failed to list posts: {e}");
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to list posts".to_owned(),
            ));
        }
    }
}
