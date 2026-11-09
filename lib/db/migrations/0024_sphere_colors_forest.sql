-- Palette verte recalée sur le vert forêt du fond (#1e4820) : les sphères
-- créées avec la palette émeraude prennent la nuance équivalente. Les couleurs
-- choisies librement par les membres ne sont pas touchées.
UPDATE "life_spheres" SET "color" = CASE upper("color")
  WHEN '#10B981' THEN '#4F9A53'
  WHEN '#047857' THEN '#2D6A30'
  WHEN '#065F46' THEN '#1E4820'
  WHEN '#6EE7B7' THEN '#9DD8A0'
  WHEN '#D1FAE5' THEN '#D6EFD7'
  ELSE "color"
END
WHERE upper("color") IN ('#10B981', '#047857', '#065F46', '#6EE7B7', '#D1FAE5');
