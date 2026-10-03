use blog_contracts::models::{Category, CreatePostPayload, Post};
use blog_contracts::models::{SummarizedPost, Tag};
use sqlx::PgPool;
use sqlx::Row;
use sqlx::postgres::PgRow;
use sqlx::types::Json;
use uuid::Timestamp;

pub async fn create_post(pool: &PgPool, payload: &CreatePostPayload) -> Result<(), sqlx::Error> {
    let mut tx = pool
        .try_begin()
        .await?
        .expect("Could not begin transaction");

    // Create post
    let post = sqlx::query(
        "INSERT INTO blog_posts (id, title, summary, content, category_id) VALUES ((SELECT uuidv7()), $1, $2, $3, $4) RETURNING id;",
    )
    .bind(&payload.title)
    .bind(&payload.summary)
    .bind(&payload.content)
    .bind(payload.category)
    .fetch_one(&mut *tx).await?;

    // Connect tags to post
    for tag_id in &payload.tags {
        sqlx::query("INSERT INTO blog_post_tags (blog_id, tag_id) VALUES ($1, $2);")
            .bind(post.get::<uuid::Uuid, &str>("id"))
            .bind(tag_id)
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await?;

    return Ok(());
}

pub async fn get_post(pool: &PgPool, blog_id: &uuid::Uuid) -> Result<Option<Post>, sqlx::Error> {
    let row = sqlx::query(
        "SELECT p.id, p.title, p.content, p.category_id, CASE WHEN c.id IS NULL THEN NULL ELSE JSON_BUILD_OBJECT('id', c.id, 'name', c.name) END AS category, COALESCE(
                JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'label', t.label, 'color', t.color))
                    FILTER (WHERE t.id IS NOT NULL),
                '[]'
            ) AS tags
        FROM blog_posts p
        LEFT JOIN categories c ON c.id = p.category_id AND c.deleted = false
        LEFT JOIN blog_post_tags bt ON bt.blog_id = p.id
        LEFT JOIN tags t ON t.id = bt.tag_id AND t.deleted = false
        WHERE p.id = $1 AND p.deleted = false
        GROUP BY p.id, c.id;",
    )
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
        "SELECT p.id, p.title, p.summary, category_id, CASE WHEN c.id IS NULL THEN NULL ELSE JSON_BUILD_OBJECT('id', c.id, 'name', c.name) END AS category, COALESCE(
                JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'label', t.label, 'color', t.color))
                    FILTER (WHERE t.id IS NOT NULL),
                '[]'
            ) AS tags
        FROM blog_posts p
        LEFT JOIN categories c ON c.id = p.category_id AND c.deleted = false
        LEFT JOIN blog_post_tags bt ON bt.blog_id = p.id
        LEFT JOIN tags t ON t.id = bt.tag_id AND t.deleted = false
        WHERE p.deleted = false
        GROUP BY p.id, c.id
        ORDER BY p.id DESC LIMIT $1 OFFSET $2;",
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
    return sqlx::query_scalar("SELECT count(*) FROM blog_posts WHERE deleted = false;")
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
        "WITH matches AS (
            SELECT id, title, summary, category_id, pdb.score(id) AS score
            FROM blog_posts
            WHERE (title ||| $1 OR content ||| $1 OR summary ||| $1) AND deleted = false
            ORDER BY score DESC, id DESC LIMIT $2 OFFSET $3
        )
        SELECT m.id, m.title, m.summary, CASE WHEN c.id IS NULL THEN NULL ELSE JSON_BUILD_OBJECT('id', c.id, 'name', c.name) END AS category, COALESCE(
            JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'label', t.label, 'color', t.color))
                FILTER (WHERE t.id IS NOT NULL),
            '[]'
        ) AS tags
        FROM matches m
        LEFT JOIN categories c ON c.id = m.category_id AND c.deleted = false
        LEFT JOIN blog_post_tags bt ON bt.blog_id = m.id
        LEFT JOIN tags t ON t.id = bt.tag_id AND t.deleted = false
        GROUP BY m.id, m.title, m.summary, m.score, c.id
        ORDER BY m.score DESC, m.id DESC;",
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

pub async fn delete_post(pool: &PgPool, blog_id: &uuid::Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE blog_posts SET deleted = true WHERE id = $1")
        .bind(blog_id)
        .execute(pool)
        .await?;

    return Ok(());
}

fn row_to_summarized_post(row: &PgRow) -> Result<SummarizedPost, sqlx::Error> {
    let id: uuid::Uuid = row.try_get("id")?;
    let title: String = row.try_get("title")?;
    let summary: String = row.try_get("summary")?;
    let category = row
        .try_get::<Option<Json<Category>>, _>("category")?
        .map(|Json(c)| return c);
    let Json(tags): Json<Vec<Tag>> = row.try_get("tags")?;
    let created_at: Timestamp = id
        .get_timestamp()
        .expect("Could not extract timestamp from uuid"); // Should never happen as long as uuid v7 is used

    return Ok(SummarizedPost::new(
        id,
        title,
        tags,
        category,
        created_at.to_unix().0.cast_signed(),
        summary,
    ));
}

fn row_to_post(row: &PgRow) -> Result<Post, sqlx::Error> {
    let id: uuid::Uuid = row.try_get("id")?;
    let title: String = row.try_get("title")?;
    let content: String = row.try_get("content")?;
    let category = row
        .try_get::<Option<Json<Category>>, _>("category")?
        .map(|Json(c)| return c);
    let Json(tags): Json<Vec<Tag>> = row.try_get("tags")?;
    let created_at: Timestamp = id
        .get_timestamp()
        .expect("Could not extract timestamp from uuid"); // Should never happen as long as uuid v7 is used

    return Ok(Post::new(
        id,
        title,
        content,
        tags,
        category,
        created_at.to_unix().0.cast_signed(),
    ));
}
