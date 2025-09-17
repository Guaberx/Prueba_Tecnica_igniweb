
-- We want to search coin_info across symbol, name, or slug, case-insensitive, and return a deduplicated list with metadata.
SELECT 
  coin_id,
  symbol,
  name,
  slug,
  JSON_OBJECT(
    'logo', logo,
    'description', description,
    'website', website,
    'category', category
  ) AS metadata
FROM coin_info
WHERE LOWER(symbol) LIKE LOWER(CONCAT('%', ?, '%'))
   OR LOWER(name)   LIKE LOWER(CONCAT('%', ?, '%'))
   OR LOWER(slug)   LIKE LOWER(CONCAT('%', ?, '%'))
GROUP BY coin_id, symbol, name, slug, logo, description, website, category
ORDER BY name ASC;
