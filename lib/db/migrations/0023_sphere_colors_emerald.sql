-- Le code couleur passe du rouge à l'émeraude : les sphères créées avec la
-- palette rouge prennent la nuance émeraude équivalente. Les couleurs choisies
-- librement par les membres ne sont pas touchées.
UPDATE "life_spheres" SET "color" = CASE upper("color")
  WHEN '#E04B5F' THEN '#10B981'
  WHEN '#B3283B' THEN '#047857'
  WHEN '#7E1D2B' THEN '#065F46'
  WHEN '#FF8A96' THEN '#6EE7B7'
  WHEN '#FFD9DE' THEN '#D1FAE5'
  ELSE "color"
END
WHERE upper("color") IN ('#E04B5F', '#B3283B', '#7E1D2B', '#FF8A96', '#FFD9DE');
