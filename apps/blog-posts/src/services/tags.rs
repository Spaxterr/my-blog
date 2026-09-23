use blog_contracts::models::CreateTagPayload;
use blog_contracts::models::Tag;
use sqlx::PgPool;
use sqlx::Row;
use sqlx::postgres::PgRow;

pub async fn create_tag(pool: &PgPool, payload: &CreateTagPayload) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO tags (id, label, color) VALUES ((SELECT uuidv7()), $1, $2);")
        .bind(&payload.label)
        .bind(&payload.color)
        .execute(pool)
        .await?;

    return Ok(());
}

pub async fn get_tag(pool: &PgPool, tag_id: &uuid::Uuid) -> Result<Option<Tag>, sqlx::Error> {
    let row = sqlx::query("SELECT id, label, color FROM tags WHERE id = $1 AND deleted = false")
        .bind(tag_id)
        .fetch_optional(pool)
        .await?;

    match row {
        Some(row) => return Ok(Option::from(row_to_tag(&row)?)),
        None => return Ok(Option::None),
    }
}

pub async fn get_all_tags(pool: &PgPool) -> Result<Vec<Tag>, sqlx::Error> {
    let rows = sqlx::query("SELECT id, label, color FROM tags WHERE deleted = false;")
        .fetch_all(pool)
        .await?;

    let mut tags: Vec<Tag> = Vec::new();
    for row in rows {
        let tag = row_to_tag(&row)?;
        tags.push(tag);
    }

    return Ok(tags);
}

pub async fn delete_tag(pool: &PgPool, tag_id: &uuid::Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE tags SET deleted = true WHERE id = $1")
        .bind(tag_id)
        .execute(pool)
        .await?;

    return Ok(());
}

fn row_to_tag(row: &PgRow) -> Result<Tag, sqlx::Error> {
    let id: uuid::Uuid = row.try_get("id")?;
    let label: String = row.try_get("label")?;
    let color: String = row.try_get("color")?;

    return Ok(Tag { id, label, color });
}
