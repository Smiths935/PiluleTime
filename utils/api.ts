import db from "./database";

// Get all medications
export const getMedications = async () => {
  //   const fakedata = [
  //     {
  //       id: 1,
  //       name: "Aspirin",
  //       dosage: "500mg",
  //       time: "08:00",
  //       frequency: "Daily",
  //     },
  //     {
  //       id: 2,
  //       name: "Ibuprofen",
  //       dosage: "200mg",
  //       time: "12:00",
  //       frequency: "Twice a day",
  //     },
  //     {
  //       id: 3,
  //       name: "Paracetamol",
  //       dosage: "500mg",
  //       time: "18:00",
  //       frequency: "Every 6 hours",
  //     },
  //   ];
  const data = await db.getAllAsync(
    "SELECT * FROM medicaments ORDER BY time ASC;"
  );
  return data;
};

// Add a new medication
export const addMedication = async (name, dosage, time, frequency) => {
  const result = await db.runAsync(
    `INSERT INTO medicaments VALUES ${name}, ${dosage}, ${time}, ${frequency})`,
    "aaa",
    100
  );
  return console.log("inserted successful", result);
};
