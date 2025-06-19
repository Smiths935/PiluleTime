import * as SQLite from "expo-sqlite";

const db = await SQLite.openDatabaseAsync("medicaments.db");

export const initDatabase = async () => {
  try {
    await db.execAsync(
      // Table medicaments
      `
       CREATE TABLE IF NOT EXISTS medicaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        dosage TEXT,
        forme TEXT,
        instructions TEXT,
        dateDebut TEXT,
        dateFin TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP);
      `
    );

    // // Table prises
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS prises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicamentId INTEGER,
    heure TEXT NOT NULL,
    frequence TEXT NOT NULL,
    FOREIGN KEY (medicamentId) REFERENCES medicaments(id);
  )`
    );

    // // Table suivi
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS suivi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    priseId INTEGER,
    date TEXT NOT NULL,
    status TEXT CHECK(status IN ('pris', 'oublié')) DEFAULT 'oublié',
    heureEffectuee TEXT,
    FOREIGN KEY (priseId) REFERENCES prises(id);
  )`
    );

    // // Table stock (facultatif)
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicamentId INTEGER,
    quantiteInitiale INTEGER,
    quantiteRestante INTEGER,
    seuilAlerte INTEGER DEFAULT 5,
    FOREIGN KEY (medicamentId) REFERENCES medicaments(id);
  )`
    );
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

export default db;
