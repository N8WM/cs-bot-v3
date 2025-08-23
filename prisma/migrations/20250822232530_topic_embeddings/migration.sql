SELECT ai.create_vectorizer(
  '"Topic"'::regclass,
  loading => ai.loading_column('summary'),
  embedding => ai.embedding_ollama('nomic-embed-text', 768),
  destination => ai.destination_table('topic_summary_embeddings')
);
