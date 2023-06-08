import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyBhtt9U9PORjn7wlRFuTXpq1_en0mFxJHI",
    authDomain: "grouplibrec.firebaseapp.com",
    projectId: "grouplibrec",
    storageBucket: "grouplibrec.appspot.com",
    messagingSenderId: "811591224870",
    appId: "1:811591224870:web:a699a26f2199359d2760e7",
    measurementId: "G-XW79519TT4"
}
  
// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig)
const db = getFirestore(appFirebase)

export default db