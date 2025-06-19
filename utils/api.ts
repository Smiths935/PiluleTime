// import db from "@/utils/database";
// import * as SQLite from "expo-sqlite";

// const database = await SQLite.openDatabaseAsync("mediremind.db");

// //Get all medications
// export const getMedications = async () => {
//   const data = await db.getAllAsync(
//     "SELECT * FROM medicaments ORDER BY time ASC;"
//   );
//   return data;
// };

// Add a new medication
// export const addMedication = async (name, dosage, time, frequency) => {
//   const result = await db.runAsync(
//     `INSERT INTO medicaments VALUES ${name}, ${dosage}, ${time}, ${frequency});`,
//     "aaa",
//     100
//   );
//   return console.log("inserted successful", result);
// };

// export const InsertMedication = (
//   nom: string,
//   dosage: string,
//   time: string,
//   instructions: string
// ) => {
//   return new Promise((resole, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `INSERT INTO medicaments (nom,dosage,time,instructions) VALUES(?,?,?,?)`,
//         [nom, dosage, time, instructions],
//         (_: any, result: unknown) => resole(result),
//         (_: any, errors: any) => reject(errors)
//       );
//     });
//   });
// };
// export const FetchMedication = () => {
//   return new Promise((resole, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `SELECT * FROM medicaments`,
//         [],
//         (_: any, result: unknown) => resole(result),
//         (_: any, errors: any) => reject(errors)
//       );
//     });
//   });
// };
