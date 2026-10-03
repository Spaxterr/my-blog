use blog_contracts::models::Category;
use blog_contracts::models::CreateCategoryPayload;
use sqlx::PgPool;
use sqlx::Row;

pub async fn get_all_categories(pool: &PgPool) -> Result<Vec<Category>, sqlx::Error> {
    let rows = sqlx::query("SELECT id, name FROM categories WHERE deleted = false ORDER BY name;")
        .fetch_all(pool)
        .await?;

    let mut categories: Vec<Category> = Vec::new();
    for row in rows {
        categories.push(Category {
            id: row.try_get("id")?,
            name: row.try_get("name")?,
        });
    }

    return Ok(categories);
}

pub async fn create_category(
    pool: &PgPool,
    payload: CreateCategoryPayload,
) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO categories (id, name) VALUES ((SELECT uuidv7()), $1);")
        .bind(payload.name)
        .execute(pool)
        .await?;

    return Ok(());
}

pub async fn delete_category(pool: &PgPool, category_id: &uuid::Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE categories SET deleted = true WHERE id = $1")
        .bind(category_id)
        .execute(pool)
        .await?;

    return Ok(());
}
