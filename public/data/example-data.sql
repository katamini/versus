-- VERSUS Game Database
-- Generated: 2026-01-21T14:20:53.741Z

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

INSERT INTO picks (id, name, image) VALUES ('1', 'Gegia', NULL);

INSERT INTO picks (id, name, image) VALUES ('2', 'Bud Spencer', NULL);

INSERT INTO picks (id, name, image) VALUES ('3', 'Iva Zanicchi', NULL);

INSERT INTO picks (id, name, image) VALUES ('4', 'Fabrizio Corona', NULL);

INSERT INTO picks (id, name, image) VALUES ('5', 'Flavia Vento', NULL);

INSERT INTO picks (id, name, image) VALUES ('6', 'Germano Mosconi', NULL);

INSERT INTO picks (id, name, image) VALUES ('7', 'Giucas Casella', NULL);

INSERT INTO picks (id, name, image) VALUES ('8', 'Valeria Marini', NULL);

INSERT INTO picks (id, name, image) VALUES ('9', 'Wanna Marchi', NULL);

INSERT INTO picks (id, name, image) VALUES ('10', 'Lino Banfi', NULL);

INSERT INTO picks (id, name, image) VALUES ('11', 'Vittorio Sgarbi', NULL);

INSERT INTO picks (id, name, image) VALUES ('12', 'Pamela Prati', NULL);

INSERT INTO picks (id, name, image) VALUES ('13', 'I Ragazzi della 3C', NULL);

INSERT INTO picks (id, name, image) VALUES ('14', 'Robocop', NULL);

INSERT INTO picks (id, name, image) VALUES ('15', 'Santi Licheri', NULL);

INSERT INTO picks (id, name, image) VALUES ('16', 'Platinette', NULL);

INSERT INTO picks (id, name, image) VALUES ('17', 'Lele Mora', NULL);

INSERT INTO picks (id, name, image) VALUES ('18', 'Ezio Greggio', NULL);

INSERT INTO picks (id, name, image) VALUES ('19', 'Il Mago Otelma', NULL);

INSERT INTO picks (id, name, image) VALUES ('20', 'Alvaro Vitali', NULL);

INSERT INTO picks (id, name, image) VALUES ('21', 'Gigi D''Alessio', NULL);

INSERT INTO picks (id, name, image) VALUES ('22', 'Mara Maionchi', NULL);

INSERT INTO picks (id, name, image) VALUES ('23', 'Teo Mammucari', NULL);

INSERT INTO picks (id, name, image) VALUES ('24', 'Paolo Bonolis', NULL);

INSERT INTO picks (id, name, image) VALUES ('25', 'Antonella Mosetti', NULL);

INSERT INTO picks (id, name, image) VALUES ('26', 'Karina Cascella', NULL);

INSERT INTO picks (id, name, image) VALUES ('27', 'Maria Teresa Ruta', NULL);

INSERT INTO picks (id, name, image) VALUES ('28', 'Tommaso Zorzi', NULL);

INSERT INTO picks (id, name, image) VALUES ('29', 'Soleil Sorge', NULL);

INSERT INTO picks (id, name, image) VALUES ('30', 'Francesca Cipriani', NULL);

INSERT INTO picks (id, name, image) VALUES ('31', 'Alex Belli', NULL);

INSERT INTO picks (id, name, image) VALUES ('32', 'Cristiano Malgioglio', NULL);

INSERT INTO picks (id, name, image) VALUES ('33', 'Rita Pavone', NULL);

INSERT INTO picks (id, name, image) VALUES ('34', 'DJ Francesco', NULL);

INSERT INTO picks (id, name, image) VALUES ('35', 'Dan Harrow', NULL);

INSERT INTO picks (id, name, image) VALUES ('36', 'Elio e le Storie Tese', NULL);

INSERT INTO picks (id, name, image) VALUES ('37', 'Giampiero Galeazzi', NULL);

INSERT INTO picks (id, name, image) VALUES ('38', 'Mike Bongiorno', NULL);

INSERT INTO picks (id, name, image) VALUES ('39', 'Raffaella Carrà', NULL);

INSERT INTO picks (id, name, image) VALUES ('40', 'Heather Parisi', NULL);

INSERT INTO picks (id, name, image) VALUES ('41', 'Lorella Cuccarini', NULL);

INSERT INTO picks (id, name, image) VALUES ('42', 'Chuck Norris', NULL);

INSERT INTO picks (id, name, image) VALUES ('43', 'Steven Seagal', NULL);

INSERT INTO picks (id, name, image) VALUES ('44', 'Nicolas Cage', NULL);

INSERT INTO picks (id, name, image) VALUES ('45', 'David Hasselhoff', NULL);

INSERT INTO picks (id, name, image) VALUES ('46', 'Jean-Claude Van Damme', NULL);

INSERT INTO picks (id, name, image) VALUES ('47', 'Mr. T', NULL);

INSERT INTO picks (id, name, image) VALUES ('48', 'Bruno Sacchi', NULL);

INSERT INTO picks (id, name, image) VALUES ('49', 'Caparezza', NULL);

INSERT INTO picks (id, name, image) VALUES ('50', 'Gianni Morandi', NULL);

