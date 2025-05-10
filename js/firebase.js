 // Import Firebase scripts
  const firebaseConfig = {
    apiKey: "AIzaSyANfXBz6sEImTv1TB6pgWZDvb8qq9MEFHA",
    authDomain: "karatroute-tracking.firebaseapp.com",
    projectId: "karatroute-tracking",
    storageBucket: "karatroute-tracking.firebasestorage.app",
    messagingSenderId: "1022042996732",
    appId: "1:1022042996732:web:c6540acf2bd51bb1f43c79"
  };

 // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  export { db };

  // Optional: Enable offline persistence (for reliability)
  db.enablePersistence().catch((err) => {
    console.log("Firebase offline persistence error:", err);
  });