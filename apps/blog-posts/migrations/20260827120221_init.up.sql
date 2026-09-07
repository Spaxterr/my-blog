CREATE TABLE blog_posts (
    id uuid NOT NULL PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    summary text,
    tags text[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ponytail: edge_ngram(3,20) so "prog" matches "programming"; index grows ~ per-word
-- prefix count. Swap back to plain text fields + pdb.fuzzy_term(prefix=>true) at query
-- time if index size ever matters more than query simplicity.
CREATE INDEX search_idx ON blog_posts
USING paradedb (
    id,
    (title::pdb.edge_ngram(3,20)),
    (content::pdb.edge_ngram(3,20)),
    (summary::pdb.edge_ngram(3,20)),
    (tags::pdb.edge_ngram(3,20))
)
WITH (key_field='id');
