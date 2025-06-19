import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";

export const database = await SQLite.openDatabaseAsync("medicaments.db");

// Initialisation de la base de données
export const initializeDatabase = async () => {
  try {
    await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS medications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          dosage TEXT NOT NULL,
          time TEXT NOT NULL,
          frequency TEXT DEFAULT 'daily',
          notes TEXT,
          is_active BOOLEAN DEFAULT 1,
          last_taken DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
  } catch (error) {
    console.error("Erreur initialisation DB:", error);
    Alert.alert("Erreur", "Impossible d'initialiser la base de données");
  }
};
