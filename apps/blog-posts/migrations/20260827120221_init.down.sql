-- Add down migration script here
DROP INDEX IF EXISTS blog_posts.search_idxIF EXISTS ;
DROP TABLE IF EXISTS blog_posts;
