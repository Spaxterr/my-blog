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

pub async fn get_all_tags(pool: &PgPool) -> Result<Vec<Tag>, sqlx::Error> {
    let rows = sqlx::query("SELECT * FROM tags;").fetch_all(pool).await?;

    let mut tags: Vec<Tag> = Vec::new();
    for row in rows {
        let tag = row_to_tag(&row)?;
        tags.push(tag);
    }

    return Ok(tags);
}

fn row_to_tag(row: &PgRow) -> Result<Tag, sqlx::Error> {
    let id: uuid::Uuid = row.try_get("id")?;
    let label: String = row.try_get("label")?;
    let color: String = row.try_get("color")?;

    return Ok(Tag { id, label, color });
}
