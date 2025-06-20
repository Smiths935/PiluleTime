📱 PiluleTime – Application Mobile de Gestion de Médicaments et de Rappels
Cas Pratique Étudiant – Développement d'une application mobile pour la gestion de prise de médicaments avec rappels personnalisés.

🧠 Contexte
De nombreux étudiants vivant seuls, ainsi que des personnes âgées, oublient régulièrement de prendre leurs médicaments à l'heure. MediRemind répond à ce besoin en offrant une solution simple et efficace pour :

Programmer des rappels médicaux

Suivre les médicaments à consommer

Éviter les oublis

## Comment lancer le projet

1. Installation des dépendences

   ```bash
   npm install
   ```

2. run l'application

   ```bash
   npx expo start
   ```


🎯 Objectif
Créer une application mobile intuitive qui permet aux utilisateurs de :

Ajouter un médicament avec horaire et dosage

Recevoir des notifications aux heures prévues

Visualiser la liste des médicaments actifs

Marquer un médicament comme pris

Modifier ou supprimer un médicament

🛠️ Stack Technique
Framework mobile : React Native (Expo)

Base de données locale : SQLite via plugin expo-sqlite

Notifications : Notifications locales via expo-notifications

Langage : TypeScript

🧩 Fonctionnalités Clés
📥 Ajout de Médicaments : nom, dosage, heure, fréquence

🕑 Rappels Automatiques : alertes locales à l’heure définie

📋 Liste Dynamique : visualisation des médicaments à prendre

✅ Action de Prise : marquer un médicament comme "pris"

✏️ Modification / Suppression : gestion des données enregistrées

🖥️ Interfaces Utilisateur
🏠 Écran d’Accueil
Liste des médicaments avec nom, dosage, heure

Bouton flottant ➕ pour ajouter un nouveau médicament

➕ Écran d’Ajout
Formulaire avec champs : nom, dosage, heure, fréquence

Bouton pour sauvegarder

📝 Écran de Détail / Modification
Affichage complet des détails du médicament

Boutons de modification et de suppression

🗃️ Gestion des Données
CRUD complet sur les médicaments via SQLite

Création de table

Requêtes d'insertion, mise à jour, suppression, récupération

Données persistées localement même après redémarrage de l’app

🔔 Notifications Locales
Intégration de notifications avec expo-notifications

Programmation automatique lors de l’ajout d’un médicament

Annulation des rappels lors de la suppression ou modification

✅ Étapes de Réalisation
1. Configuration de l’Environnement
node, expo-cli, expo-sqlite, expo-notifications

Simulateur Android/iOS ou appareil réel

2. Conception UI
Design simple, fonctionnel et accessible

3. Développement
Gestion des états

Intégration base de données et notifications

Navigation (App Router)

4. Tests
Ajout, modification, suppression de médicaments

Déclenchement des rappels

Validation de la logique de marquage "pris"

🚀 Installation et Lancement
Cloner le dépôt

bash
Copier
Modifier
git clone https://github.com/votre-utilisateur/mediremind.git
cd mediremind
Installer les dépendances

bash
Copier
Modifier
npm install
Lancer le projet

bash
Copier
Modifier
npx expo start
Tester sur un appareil ou simulateur

🧪 Critères de Qualité
✅ Fonctionnalité complète du CRUD

✅ Notifications locales fonctionnelles

✅ Interface claire et épurée

✅ Code bien structuré et commenté

✅ Respect des bonnes pratiques mobile

📚 Ressources Utiles
Documentation React Native

Expo SQLite

Expo Notifications

React Navigation

TypeScript for React Native

🤝 Auteurs et Contributeurs
Projet réalisé dans un cadre pédagogique.
Développé par : [Votre Nom ou Pseudo GitHub]

📦 Structure du Projet
pgsql
Copier
Modifier
mediremind/
├── assets/
├── components/
├── screens/
│   ├── HomeScreen.tsx
│   ├── AddMedicationScreen.tsx
│   └── MedicationDetailScreen.tsx
├── services/
│   ├── database.ts
│   └── notifications.ts
├── App.tsx
└── README.md
📩 Contact
Pour toute suggestion ou question, vous pouvez ouvrir une issue ou me contacter sur LinkedIn.
