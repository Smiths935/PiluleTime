import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import * as SQLite from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
  }),
});

const MediRemindApp = () => {
  const [db, setDb] = useState(null);
  const [medications, setMedications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    time: new Date(),
    frequency: "daily",
    notes: "",
  });

  useEffect(() => {
    initializeApp();
  }, []);

  // Initialisation de l'application
  const initializeApp = async () => {
    await requestNotificationPermissions();
    await initializeDatabase();
  };

  // Demander les permissions de notification
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissions requises",
        "Les notifications sont nécessaires pour les rappels de médicaments."
      );
    }
  };

  // Initialisation de la base de données
  const initializeDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync("mediremind.db");

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

      setDb(database);
      loadMedications(database);
    } catch (error) {
      console.error("Erreur initialisation DB:", error);
      Alert.alert("Erreur", "Impossible d'initialiser la base de données");
    }
  };

  // Charger tous les médicaments
  const loadMedications = async (database = db) => {
    if (!database) return;

    try {
      const allMedications = await database.getAllAsync(
        "SELECT * FROM medications WHERE is_active = 1 ORDER BY time ASC"
      );
      setMedications(allMedications);
    } catch (error) {
      console.error("Erreur chargement médicaments:", error);
    }
  };

  // Planifier une notification
  const scheduleNotification = async (medication) => {
    try {
      const [hours, minutes] = medication.time.split(":");
      const notificationTime = new Date();
      notificationTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Si l'heure est déjà passée aujourd'hui, programmer pour demain
      if (notificationTime <= new Date()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      const trigger = {
        hour: parseInt(hours),
        minute: parseInt(minutes),
        repeats: medication.frequency === "daily",
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊 Rappel de médicament",
          body: `Il est temps de prendre ${medication.name} (${medication.dosage})`,
          sound: true,
        },
        trigger,
      });
    } catch (error) {
      console.error("Erreur planification notification:", error);
    }
  };

  // Ajouter un médicament
  const addMedication = async () => {
    if (!formData.name.trim() || !formData.dosage.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const timeString = formData.time.toTimeString().substring(0, 5);

      const result = await db.runAsync(
        "INSERT INTO medications (name, dosage, time, frequency, notes) VALUES (?, ?, ?, ?, ?)",
        formData.name.trim(),
        formData.dosage.trim(),
        timeString,
        formData.frequency,
        formData.notes.trim()
      );

      // Planifier la notification
      const newMedication = {
        id: result.lastInsertRowId,
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        time: timeString,
        frequency: formData.frequency,
      };

      await scheduleNotification(newMedication);

      resetForm();
      setShowAddModal(false);
      loadMedications();

      Alert.alert("Succès", "Médicament ajouté avec succès");
    } catch (error) {
      console.error("Erreur ajout médicament:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le médicament");
    }
  };

  // Modifier un médicament
  const updateMedication = async () => {
    if (!formData.name.trim() || !formData.dosage.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const timeString = formData.time.toTimeString().substring(0, 5);

      await db.runAsync(
        "UPDATE medications SET name = ?, dosage = ?, time = ?, frequency = ?, notes = ? WHERE id = ?",
        formData.name.trim(),
        formData.dosage.trim(),
        timeString,
        formData.frequency,
        formData.notes.trim(),
        selectedMedication.id
      );

      // Replanifier la notification
      await Notifications.cancelScheduledNotificationAsync(
        selectedMedication.id.toString()
      );
      const updatedMedication = {
        ...selectedMedication,
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        time: timeString,
        frequency: formData.frequency,
      };
      await scheduleNotification(updatedMedication);

      resetForm();
      setShowEditModal(false);
      setSelectedMedication(null);
      loadMedications();

      Alert.alert("Succès", "Médicament modifié avec succès");
    } catch (error) {
      console.error("Erreur modification médicament:", error);
      Alert.alert("Erreur", "Impossible de modifier le médicament");
    }
  };

  // Marquer comme pris
  const markAsTaken = async (medication) => {
    try {
      await db.runAsync(
        "UPDATE medications SET last_taken = CURRENT_TIMESTAMP WHERE id = ?",
        medication.id
      );

      loadMedications();
      Alert.alert("✅", `${medication.name} marqué comme pris`);
    } catch (error) {
      console.error("Erreur marquage pris:", error);
    }
  };

  // Supprimer un médicament
  const deleteMedication = (medication) => {
    Alert.alert(
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer ${medication.name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync(
                "UPDATE medications SET is_active = 0 WHERE id = ?",
                medication.id
              );

              // Annuler la notification
              await Notifications.cancelScheduledNotificationAsync(
                medication.id.toString()
              );

              loadMedications();
              Alert.alert("Succès", "Médicament supprimé");
            } catch (error) {
              console.error("Erreur suppression:", error);
              Alert.alert("Erreur", "Impossible de supprimer le médicament");
            }
          },
        },
      ]
    );
  };

  // Ouvrir le modal d'édition
  const openEditModal = (medication) => {
    const [hours, minutes] = medication.time.split(":");
    const timeDate = new Date();
    timeDate.setHours(parseInt(hours), parseInt(minutes));

    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      time: timeDate,
      frequency: medication.frequency,
      notes: medication.notes || "",
    });
    setSelectedMedication(medication);
    setShowEditModal(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      time: new Date(),
      frequency: "daily",
      notes: "",
    });
  };

  // Formater l'heure d'affichage
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Vérifier si le médicament a été pris aujourd'hui
  const wasTakenToday = (lastTaken) => {
    if (!lastTaken) return false;
    const today = new Date().toDateString();
    const takenDate = new Date(lastTaken).toDateString();
    return today === takenDate;
  };

  // Rendu d'un médicament
  const renderMedication = ({ item }) => (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{item.name}</Text>
          <Text style={styles.medicationDosage}>{item.dosage}</Text>
          <Text style={styles.medicationTime}>🕒 {formatTime(item.time)}</Text>
          {item.frequency !== "daily" && (
            <Text style={styles.medicationFrequency}>📅 {item.frequency}</Text>
          )}
        </View>

        <View style={styles.medicationActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.takenButton,
              wasTakenToday(item.last_taken) && styles.takenButtonDisabled,
            ]}
            onPress={() => markAsTaken(item)}
            disabled={wasTakenToday(item.last_taken)}
          >
            <Text style={styles.actionButtonText}>
              {wasTakenToday(item.last_taken) ? "✅" : "💊"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteMedication(item)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.medicationNotes}>📝 {item.notes}</Text>
      )}

      {wasTakenToday(item.last_taken) && (
        <Text style={styles.takenToday}>
          ✅ Pris aujourd'hui à{" "}
          {new Date(item.last_taken).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}
    </View>
  );

  // Formulaire modal
  const renderFormModal = (isEdit = false) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>
              {isEdit ? "Modifier le médicament" : "Ajouter un médicament"}
            </Text>

            <Text style={styles.fieldLabel}>Nom du médicament *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Paracétamol"
            />

            <Text style={styles.fieldLabel}>Dosage *</Text>
            <TextInput
              style={styles.input}
              value={formData.dosage}
              onChangeText={(text) =>
                setFormData({ ...formData, dosage: text })
              }
              placeholder="Ex: 500mg, 2 comprimés"
            />

            <Text style={styles.fieldLabel}>Heure de prise</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                🕒{" "}
                {formData.time.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={formData.time}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setFormData({ ...formData, time: selectedTime });
                  }
                }}
              />
            )}

            <Text style={styles.fieldLabel}>Fréquence</Text>
            <View style={styles.frequencyContainer}>
              {["daily", "weekly", "monthly"].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    formData.frequency === freq && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, frequency: freq })}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      formData.frequency === freq &&
                        styles.frequencyButtonTextActive,
                    ]}
                  >
                    {freq === "daily"
                      ? "Quotidien"
                      : freq === "weekly"
                      ? "Hebdomadaire"
                      : "Mensuel"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Instructions particulières..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedMedication(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={isEdit ? updateMedication : addMedication}
              >
                <Text style={styles.saveButtonText}>
                  {isEdit ? "Modifier" : "Ajouter"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💊 MediRemind</Text>
        <Text style={styles.headerSubtitle}>
          {medications.length} médicament{medications.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Liste des médicaments */}
      {medications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun médicament ajouté</Text>
          <Text style={styles.emptyStateSubtext}>
            Appuyez sur le bouton + pour ajouter votre premier médicament
          </Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          renderItem={renderMedication}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.medicationsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bouton d'ajout */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Modals */}
      {renderFormModal(false)}
      {renderFormModal(true)}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#2563eb",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#bfdbfe",
    textAlign: "center",
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  medicationsList: {
    padding: 16,
    paddingBottom: 80,
  },
  medicationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  medicationFrequency: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  medicationActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  takenButton: {
    backgroundColor: "#10b981",
  },
  takenButtonDisabled: {
    backgroundColor: "#a7f3d0",
  },
  editButton: {
    backgroundColor: "#f59e0b",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    fontSize: 16,
  },
  medicationNotes: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    fontStyle: "italic",
  },
  takenToday: {
    fontSize: 12,
    color: "#10b981",
    marginTop: 8,
    fontWeight: "500",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  timeButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  timeButtonText: {
    fontSize: 16,
    color: "#374121",
  },
  frequencyContainer: {
    flexDirection: "row",
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
  },
  frequencyButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  frequencyButtonText: {
    textAlign: "center",
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  frequencyButtonTextActive: {
    color: "white",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  cancelButtonText: {
    color: "#374141",
    fontWeight: "500",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "500",
  },
});
export default MediRemindApp;
