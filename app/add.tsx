import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Open the database
//const db = SQLite.openDatabase('mediremind.db');

// Configure notifications
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

export default function AddMedoc() {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState(new Date());
  const [frequency, setFrequency] = useState("daily");
  const [showTimePicker, setShowTimePicker] = useState(false);

  const router = useRouter();

  // Request notification permissions
  //   const requestNotificationPermissions = async () => {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     return status === 'granted';
  //   };

  // Schedule notification
  //   const scheduleNotification = async (medicationName, medicationDosage, medicationTime) => {
  //     const hasPermission = await requestNotificationPermissions();

  // if (!hasPermission) {
  //   Alert.alert(
  //     'Permission Required',
  //     'Notifications permission is required to set reminders',
  //     [{ text: 'OK' }]
  //   );
  //   return;
  // }

  // Parse the time string to get hours and minutes
  // const hours = medicationTime.getHours();
  // const minutes = medicationTime.getMinutes();

  // Create a new date object for today with the specified time
  // const scheduledTime = new Date();
  // scheduledTime.setHours(hours);
  // scheduledTime.setMinutes(minutes);
  // scheduledTime.setSeconds(0);

  // If the time has already passed today, schedule for tomorrow
  // if (scheduledTime <= new Date()) {
  //   scheduledTime.setDate(scheduledTime.getDate() + 1);
  // }

  // Schedule the notification
  // await Notifications.scheduleNotificationAsync({
  //   content: {
  //     title: 'Medication Reminder',
  //     body: `Time to take ${medicationName} - ${medicationDosage}`,
  //     sound: true,
  //   },
  //   trigger: {
  //     hour: hours,
  //     minute: minutes,
  //     repeats: true,
  //   },
  // });
  //};

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatTimeForDisplay = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutes} ${ampm}`;
  };

  const formatTimeForStorage = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutes}`;
  };

  const saveMedication = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a medication name");
      return;
    }

    if (!dosage.trim()) {
      Alert.alert("Error", "Please enter a dosage");
      return;
    }

    try {
      // Format time for storage
      const timeString = formatTimeForStorage(time);

      // Save to database
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO medications (name, dosage, time, frequency) VALUES (?, ?, ?, ?);",
          [name, dosage, timeString, frequency],
          async (_, result) => {
            // Schedule notification
            await scheduleNotification(name, dosage, time);

            // Navigate back to home screen
            navigation.navigate("Home");
          },
          (_, error) => {
            console.error("Error saving medication:", error);
            Alert.alert("Error", "Failed to save medication");
          }
        );
      });
    } catch (error) {
      console.error("Error in saveMedication:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="white"
            style={styles.backButtonText}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un medicament</Text>
      </View>

      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Nom medicament</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Entrer le nom du medicament"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Dosage</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g., 1 pill, 5ml, etc."
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Heure de prise</Text>
        <TouchableOpacity
          style={styles.timePickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.timePickerButtonText}>
            {formatTimeForDisplay(time)}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <Text style={styles.label}>Fréquence de prise</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={frequency}
            onValueChange={(itemValue) => setFrequency(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Jour" value="jour" />
            <Picker.Item label="Semaine" value="semaine" />
            <Picker.Item label="Mois" value="mois" />
            <Picker.Item label="Si necessaire" value="si_necessaire" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveMedication}>
          <Text style={styles.saveButtonText}> Enregistrement</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#4a90e2",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 16,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  timePickerButton: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  timePickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
