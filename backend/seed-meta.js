const { sequelize } = require('./src/config/db');

async function seed() {
  try {
    await sequelize.query('CREATE TABLE IF NOT EXISTS SequelizeMeta (name VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL, PRIMARY KEY (name)) ENGINE=InnoDB;');
    await sequelize.query("INSERT IGNORE INTO SequelizeMeta (name) VALUES ('20260914000000-initial-schema.js');");
    console.log('Seeded SequelizeMeta');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
