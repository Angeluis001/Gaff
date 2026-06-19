CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL,
  media_ref TEXT NOT NULL,
  poster_ref TEXT,
  caption TEXT,
  alt_text TEXT,
  tags JSONB,
  boat_category TEXT,
  species TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gallery_items_sort_order_idx ON gallery_items(sort_order);
CREATE INDEX IF NOT EXISTS gallery_items_published_idx ON gallery_items(published);
CREATE INDEX IF NOT EXISTS gallery_items_media_type_idx ON gallery_items(media_type);
