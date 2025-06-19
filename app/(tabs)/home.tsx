import { getMedications } from "@/utils/api";
import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Open the database
//const db = SQLite.openDatabaseSync("mediremind.db");

export default function HomeScreen() {
  const [medications, setMedications] = useState([]);
  const router = useRouter();

  // Initialize database on first load
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        //await initDatabase();
        loadMedications();
      } catch (error) {
        console.error("Database initialization error:", error);
      }
    };

    setupDatabase();
  }, []);

  // Reload medications when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [])
  );

  const loadMedications = async () => {
    try {
      const medicamentList = await getMedications();
      setMedications(medicamentList);
    } catch (error) {
      console.error("Error loading medications:", error);
    }
  };

  //   const handleMarkAsTaken = async (id) => {
  //     try {
  //       // await markMedicationAsTaken(id);
  //       loadMedications();
  //     } catch (error) {
  //       console.error("Error marking medication as taken:", error);
  //     }
  //   };

  const renderMedicationItem = ({ item }) => {
    //const formattedTime = formatTimeForDisplay(item.time);

    return (
      <View style={styles.medicationCard}>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{item.name}</Text>
          <Text style={styles.medicationDetails}>Dosage: {item.dosage}</Text>
          <Text style={styles.medicationDetails}>Time: {"formattedTime"}</Text>
          <Text style={styles.medicationDetails}>
            Frequency: {item.frequency}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          {!item.taken ? (
            <TouchableOpacity
              style={styles.takenButton}
              // onPress={() => handleMarkAsTaken(item.id)}
            >
              <Text style={styles.buttonText}>Mark as Taken</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.takenIndicator}>
              <Text style={styles.takenText}>✓ Taken</Text>
            </View>
          )}
          <Link
            href={{
              pathname: "/add",
              params: { medication: item },
            }}
            style={styles.editButton}
          >
            <Text style={styles.buttonText}>Modifier</Text>
          </Link>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <Text style={styles.title}>PiluleTme</Text>
        <Text style={styles.subtitle}>
          Votre Rappels de prises de médicament
        </Text>
      </View>

      {medications.length > 0 ? (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMedicationItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun medicament trouver</Text>
          <Text style={styles.emptyStateSubText}>
            Appuiyez sur le bouton "+" pour ajouter un nouveau médicament.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    backgroundColor: "#4a90e2",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  medicationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationInfo: {
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  medicationDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  takenButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 0.4,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  takenIndicator: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  takenText: {
    color: "#4caf50",
    fontWeight: "500",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4a90e2",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    maxWidth: "80%",
  },
});
