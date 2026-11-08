-- Un seul code couleur (rouge et blanc) : les sphères créées avec l'ancienne
-- palette (bleu, corail, doré, crème, pierre) passent aux nuances rouge et blanc
-- équivalentes. Les couleurs choisies librement par les membres ne sont pas touchées.
UPDATE "life_spheres" SET "color" = CASE upper("color")
  WHEN '#4A6FA5' THEN '#E04B5F'
  WHEN '#D97A5A' THEN '#FF8A96'
  WHEN '#C9A86A' THEN '#FFFFFF'
  WHEN '#F5F2EE' THEN '#FFD9DE'
  WHEN '#3E5C8A' THEN '#B3283B'
  WHEN '#B8B3AE' THEN '#7E1D2B'
  ELSE "color"
END
WHERE upper("color") IN ('#4A6FA5', '#D97A5A', '#C9A86A', '#F5F2EE', '#3E5C8A', '#B8B3AE');
