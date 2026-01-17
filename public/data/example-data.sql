-- VERSUS Game Database
-- Generated: 2026-01-17T02:25:24.934Z

CREATE TABLE IF NOT EXISTS picks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT
);

CREATE TABLE IF NOT EXISTS properties (
  pick_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  value REAL NOT NULL,
  image TEXT,
  FOREIGN KEY (pick_id) REFERENCES picks(id)
);

CREATE TABLE IF NOT EXISTS property_categories (
  name TEXT PRIMARY KEY,
  image TEXT
);

INSERT INTO property_categories (name, image) VALUES ('DOGS', NULL);
INSERT INTO property_categories (name, image) VALUES ('MONEY', NULL);
INSERT INTO property_categories (name, image) VALUES ('EYES', NULL);
INSERT INTO property_categories (name, image) VALUES ('HEIGHT', NULL);
INSERT INTO property_categories (name, image) VALUES ('SPEED', NULL);

INSERT INTO picks (id, name, image) VALUES ('1', 'Alice', NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('1', 'DOGS', 10, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('1', 'MONEY', 5, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('1', 'EYES', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('1', 'HEIGHT', 165, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('1', 'SPEED', 15, NULL);

INSERT INTO picks (id, name, image) VALUES ('2', 'Bob', NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('2', 'DOGS', 3, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('2', 'MONEY', 20, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('2', 'EYES', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('2', 'HEIGHT', 180, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('2', 'SPEED', 12, NULL);

INSERT INTO picks (id, name, image) VALUES ('3', 'Charlie', NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('3', 'DOGS', 7, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('3', 'MONEY', 15, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('3', 'EYES', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('3', 'HEIGHT', 175, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('3', 'SPEED', 18, NULL);

INSERT INTO picks (id, name, image) VALUES ('4', 'Diana', NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('4', 'DOGS', 15, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('4', 'MONEY', 8, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('4', 'EYES', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('4', 'HEIGHT', 170, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('4', 'SPEED', 20, NULL);

INSERT INTO picks (id, name, image) VALUES ('5', 'Eve', NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('5', 'DOGS', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('5', 'MONEY', 30, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('5', 'EYES', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('5', 'HEIGHT', 160, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('5', 'SPEED', 10, NULL);

INSERT INTO picks (id, name, image) VALUES ('6', 'Frank', NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('6', 'DOGS', 12, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('6', 'MONEY', 12, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('6', 'EYES', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('6', 'HEIGHT', 185, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('6', 'SPEED', 14, NULL);

INSERT INTO picks (id, name, image) VALUES ('7', 'Grace', NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('7', 'DOGS', 5, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('7', 'MONEY', 25, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('7', 'EYES', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('7', 'HEIGHT', 168, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('7', 'SPEED', 16, NULL);

INSERT INTO picks (id, name, image) VALUES ('8', 'Henry', NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('8', 'DOGS', 20, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('8', 'MONEY', 3, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('8', 'EYES', 2, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('8', 'HEIGHT', 178, NULL);
INSERT INTO properties (pick_id, property_name, value, image) VALUES ('8', 'SPEED', 22, NULL);

