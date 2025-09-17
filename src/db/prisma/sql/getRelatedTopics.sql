-- @param {String} $1:query

WITH q AS (
  SELECT ai.ollama_embed(
    'nomic-embed-text',
    COALESCE($1::text, 'placeholder'),
    host => current_setting('app.ollama_host', true)
  ) AS v
)
SELECT
  t.id as id,
  t.chunk as summary,
  t.embedding <=> q.v as distance
FROM "topic_summary_embeddings" t, q
ORDER BY distance
LIMIT 10
