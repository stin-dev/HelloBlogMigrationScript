import * as admin from "firebase-admin";

const serviceAccount = require("../firebase_key.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.collectionGroup("blogs").get().then(querySnapshot => {
	querySnapshot.forEach((snapshot => {
		const data = snapshot.data();
		const newData = {
			blogId: data.blogId,
			blogTitle: data.blogTitle,
			topEntryList: data.topEntryList,
			unitId: data.unitId,
		}

		snapshot.ref.set(newData);
	}))
})