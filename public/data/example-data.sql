-- VERSUS Game Database
-- Generated: 2026-01-18T23:43:29.275Z

CREATE TABLE IF NOT EXISTS picks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT
);

CREATE TABLE IF NOT EXISTS facts (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT
);

CREATE TABLE IF NOT EXISTS pick_facts (
  pick_id TEXT NOT NULL,
  fact_id TEXT NOT NULL,
  PRIMARY KEY (pick_id, fact_id),
  FOREIGN KEY (pick_id) REFERENCES picks(id),
  FOREIGN KEY (fact_id) REFERENCES facts(id)
);

INSERT INTO facts (id, description, category, image) VALUES ('nobel_prize', 'WON THE NOBEL PRIZE', 'AWARDS', NULL);
INSERT INTO facts (id, description, category, image) VALUES ('hotdog_champion', 'ATE THE MOST HOTDOGS', 'FOOD', NULL);
INSERT INTO facts (id, description, category, image) VALUES ('tallest_person', 'IS THE TALLEST PERSON', 'PHYSICAL', NULL);
INSERT INTO facts (id, description, category, image) VALUES ('fastest_runner', 'IS THE FASTEST RUNNER', 'SPORTS', NULL);
INSERT INTO facts (id, description, category, image) VALUES ('richest_person', 'IS THE RICHEST PERSON', 'MONEY', NULL);
INSERT INTO facts (id, description, category, image) VALUES ('most_pets', 'HAS THE MOST PETS', 'ANIMALS', NULL);
INSERT INTO facts (id, description, category, image) VALUES ('youngest', 'IS THE YOUNGEST', 'AGE', NULL);
INSERT INTO facts (id, description, category, image) VALUES ('biggest_library', 'HAS THE BIGGEST LIBRARY', 'BOOKS', NULL);

INSERT INTO picks (id, name, image) VALUES ('1', 'Alice', NULL);
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('1', 'nobel_prize');
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('1', 'biggest_library');

INSERT INTO picks (id, name, image) VALUES ('2', 'Bob', NULL);
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('2', 'richest_person');
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('2', 'tallest_person');

INSERT INTO picks (id, name, image) VALUES ('3', 'Charlie', NULL);
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('3', 'hotdog_champion');
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('3', 'youngest');

INSERT INTO picks (id, name, image) VALUES ('4', 'Diana', NULL);
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('4', 'most_pets');
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('4', 'fastest_runner');

INSERT INTO picks (id, name, image) VALUES ('5', 'Eve', NULL);
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('5', 'fastest_runner');
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('5', 'richest_person');

INSERT INTO picks (id, name, image) VALUES ('6', 'Frank', NULL);
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('6', 'most_pets');
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('6', 'hotdog_champion');

INSERT INTO picks (id, name, image) VALUES ('7', 'Grace', NULL);
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('7', 'biggest_library');
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('7', 'tallest_person');

INSERT INTO picks (id, name, image) VALUES ('8', 'Henry', NULL);
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('8', 'nobel_prize');
INSERT INTO pick_facts (pick_id, fact_id) VALUES ('8', 'youngest');

