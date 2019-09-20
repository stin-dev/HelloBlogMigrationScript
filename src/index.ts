import * as admin from "firebase-admin";
import * as fs from "fs";
import * as csv from "csv/lib/sync";
import * as I from "./interface";

const serviiceAccount = require("../firebase_key.json");

admin.initializeApp({
	credential: admin.credential.cert(serviiceAccount)
});

const db = admin.firestore();

function csvToObject<T>(name: string): T[] {
	const file = fs.readFileSync(`${__dirname}/csv/${name}.csv`);
	const values: any[] = csv.parse(file, { columns: true, cast: true });

	return values;
}

const units = csvToObject<I.UnitOnCsv>("units");
const blogs = csvToObject<I.BlogOnCsv>("blogs");
const themes = csvToObject<I.ThemeOnCsv>("themes");
const entries = csvToObject<I.EntryOnCsv>("entries");
const imageurls = csvToObject<I.ImageUrlOnCsv>("imageurls");
const unitsCollectionRef = db.collection("units");

for (let unit_index = 0; unit_index < units.length; unit_index++) {
	const unit = units[unit_index];
	const blogs_of_unit = blogs.filter(b => b.unit_id === unit.unit_id);

	// Firestore登録用
	const unitOnFirestore: I.UnitOnFirestore = { unitId: unit.screen_name, unitName: unit.unit_name };

	const unitDocRef = unitsCollectionRef.doc(unitOnFirestore.unitId);

	// unitの登録
	unitDocRef.set(unitOnFirestore).then(_ => {
		for (let blog_index = 0; blog_index < blogs_of_unit.length; blog_index++) {
			const blog = blogs_of_unit[blog_index];
			const themes_of_blog = themes.filter(t => t.blog_id === blog.blog_id);
			const entries_of_blog = entries.filter(e => e.blog_id === blog.blog_id);

			const blogOnFirestore: I.BlogOnFirestore = {
				blogId: blog.ameba_id,
				blogTitle: blog.blog_title,
				unitId: unitOnFirestore.unitId,
				lastEntryCreatedDatetime: "2000-01-01T00:00:00.000+09:00"
			}

			blogOnFirestore.lastEntryCreatedDatetime = entries_of_blog.reduce((a, b) => a.entry_created_datetime > b.entry_created_datetime ? a : b).entry_created_datetime;

			const blogDocRef = unitDocRef.collection("blogs").doc(blogOnFirestore.blogId);

			// blogの登録
			blogDocRef.set(blogOnFirestore).then(_ => {
				for (let theme_index = 0; theme_index < themes_of_blog.length; theme_index++) {
					const theme = themes_of_blog[theme_index];

					const themeOnFirestore: I.ThemeOnFirestore = {
						themeId: String(theme.theme_id),
						blogId: blogOnFirestore.blogId,
						unitId: unitOnFirestore.unitId,
						themeName: theme.theme_name,
					}

					const themeDocRef = blogDocRef.collection("themes").doc(themeOnFirestore.themeId);

					// themeの登録
					themeDocRef.set(themeOnFirestore);
				}

				for (let entry_index = 0; entry_index < entries_of_blog.length; entry_index++) {
					const entry = entries_of_blog[entry_index];
					const imageurls_of_entry = imageurls.filter(i => i.blog_id === blog.blog_id && i.entry_id === entry.entry_id);

					const entryOnFirestore: I.EntryOnFirestore = {
						entryId: String(entry.entry_id),
						entryCreatedDatetime: entry.entry_created_datetime,
						entryTitle: entry.entry_title,
						unitId: unitOnFirestore.unitId,
						blogId: blogOnFirestore.blogId,
						themeId: String(entry.theme_id),
					}

					const entryDocRef = blogDocRef.collection("entries").doc(entryOnFirestore.entryId);

					// entryの登録
					entryDocRef.set(entryOnFirestore).then(_ => {
						for (let imageurls_index = 0; imageurls_index < imageurls_of_entry.length; imageurls_index++) {
							const imageurl = imageurls_of_entry[imageurls_index];

							const imageurlOnFirestore: I.ImageUrlOnFirestore = {
								imageurlId: String(imageurl.image_id),
								imageUrl: imageurl.image_url,
								unitId: unitOnFirestore.unitId,
								blogId: blogOnFirestore.blogId,
								themeId: entryOnFirestore.themeId,
								entryId: entryOnFirestore.entryId,
								entryCreatedDatetime: entryOnFirestore.entryCreatedDatetime,
							}

							const imageurlDocRef = entryDocRef.collection("imageurls").doc(imageurlOnFirestore.imageurlId);

							// imageurlの登録
							imageurlDocRef.set(imageurlOnFirestore);
						}
					});
				}
			});
		}
	});
}
