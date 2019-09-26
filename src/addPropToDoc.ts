import * as admin from "firebase-admin";

const serviceAccount = require("../firebase_key.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.collectionGroup("blogs").get().then(querySnapshot => {
	querySnapshot.forEach((snapshot => {
		snapshot.ref.set({ topEntryList: ["dummy"] }, { merge: true })
	}))
})