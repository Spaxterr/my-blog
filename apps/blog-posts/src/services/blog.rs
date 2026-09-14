use blog_contracts::models::SummarizedPost;
use blog_contracts::models::{CreatePostPayload, Post};
use sqlx::PgPool;
use sqlx::Row;
use sqlx::postgres::PgRow;
use sqlx::types::time;

pub async fn create_post(pool: &PgPool, payload: &CreatePostPayload) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO blog_posts (id, title, summary, content, tags) VALUES ((SELECT uuidv7()), $1, $2, $3, $4);",
    )
    .bind(&payload.title)
    .bind(&payload.summary)
    .bind(&payload.content)
    .bind(&payload.tags)
    .execute(pool)
    .await?;

    return Ok(());
}

pub async fn get_post(pool: &PgPool, blog_id: &uuid::Uuid) -> Result<Option<Post>, sqlx::Error> {
    let row =
        sqlx::query("SELECT id, title, content, tags, created_at FROM blog_posts WHERE id = $1")
            .bind(blog_id)
            .fetch_optional(pool)
            .await?;

    match row {
        Some(post) => return Ok(Option::from(row_to_post(&post)?)),
        None => return Ok(Option::None),
    }
}

pub async fn get_all_posts(
    pool: &PgPool,
    page: i32,
    count: i32,
) -> Result<Vec<SummarizedPost>, sqlx::Error> {
    let rows = sqlx::query(
        "SELECT id, title, summary, tags, created_at FROM blog_posts ORDER BY created_at DESC LIMIT $1 OFFSET $2;",
    )
    .bind(count)
    .bind((page - 1) * count)
    .fetch_all(pool)
    .await?;

    let mut posts: Vec<SummarizedPost> = Vec::new();
    for row in rows {
        let blog_post = row_to_summarized_post(&row)?;
        posts.push(blog_post);
    }

    return Ok(posts);
}

pub async fn count_posts(pool: &PgPool) -> Result<i64, sqlx::Error> {
    return sqlx::query_scalar("SELECT count(*) FROM blog_posts;")
        .fetch_one(pool)
        .await;
}

pub async fn search_posts(
    pool: &PgPool,
    search_term: &str,
    page: i32,
    count: i32,
) -> Result<Vec<SummarizedPost>, sqlx::Error> {
    let records = sqlx::query(
        "SELECT id, title, summary, tags, created_at, pdb.score(id)
            FROM blog_posts WHERE title ||| $1 OR content ||| $1 OR summary ||| $1 OR tags ||| $1
            ORDER BY pdb.score(id) DESC LIMIT $2 OFFSET $3;",
    )
    .bind(search_term)
    .bind(count)
    .bind((page - 1) * count)
    .fetch_all(pool)
    .await?;

    let mut posts: Vec<SummarizedPost> = Vec::new();
    for row in records {
        let blog_post = row_to_summarized_post(&row)?;
        posts.push(blog_post);
    }

    return Ok(posts);
}

fn row_to_summarized_post(row: &PgRow) -> Result<SummarizedPost, sqlx::Error> {
    let id: uuid::Uuid = row.try_get("id")?;
    let title: String = row.try_get("title")?;
    let summary: String = row.try_get("summary")?;
    let tags: Vec<String> = row.try_get("tags")?;
    let created_at: time::OffsetDateTime = row.try_get("created_at")?;

    return Ok(SummarizedPost::new(
        id.to_string(),
        title,
        tags,
        created_at.unix_timestamp(),
        summary,
    ));
}

fn row_to_post(row: &PgRow) -> Result<Post, sqlx::Error> {
    let id: uuid::Uuid = row.try_get("id")?;
    let title: String = row.try_get("title")?;
    let content: String = row.try_get("content")?;
    let tags: Vec<String> = row.try_get("tags")?;
    let created_at: time::OffsetDateTime = row.try_get("created_at")?;

    return Ok(Post::new(
        id.to_string(),
        title,
        content,
        tags,
        created_at.unix_timestamp(),
    ));
}
