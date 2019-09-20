import * as fs from "fs";
import * as csv from "csv/lib/sync";
import * as I from "./interface";

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

const unitsOnFS: I.UnitOnFirestore[] = [];
const blogsOnFS: I.BlogOnFirestore[] = [];
const themesOnFS: I.ThemeOnFirestore[] = [];
const entriesOnFS: I.EntryOnFirestore[] = [];
const imageurlsOnFS: I.ImageUrlOnFirestore[] = [];

for (let unit_i = 0; unit_i < units.length; unit_i++) {
	const unit = units[unit_i];
	const blogsOfUnit = blogs.filter(b => b.unit_id === unit.unit_id);

	const unitOnFS: I.UnitOnFirestore = { unitId: unit.screen_name, unitName: unit.unit_name };

	unitsOnFS.push(unitOnFS);

	for (let blog_i = 0; blog_i < blogsOfUnit.length; blog_i++) {
		const blog = blogsOfUnit[blog_i];
		const themesOfBlog = themes.filter(t => t.blog_id === blog.blog_id);
		const entriesOfBlog = entries.filter(e => e.blog_id === blog.blog_id);
		const lastEntryCreatedDatetime = entriesOfBlog.reduce((a, b) => a.entry_created_datetime > b.entry_created_datetime ? a : b).entry_created_datetime;

		const blogOnFS: I.BlogOnFirestore = { blogId: blog.ameba_id, blogTitle: blog.blog_title, lastEntryCreatedDatetime: lastEntryCreatedDatetime, unitId: unitOnFS.unitId };

		blogsOnFS.push(blogOnFS);

		for (let theme_i = 0; theme_i < themesOfBlog.length; theme_i++) {
			const theme = themesOfBlog[theme_i];

			const themeOnFS: I.ThemeOnFirestore = {
				blogId: blogOnFS.blogId,
				themeId: String(theme.theme_id),
				themeName: theme.theme_name,
				unitId: unitOnFS.unitId,
			}

			themesOnFS.push(themeOnFS);
		}

		for (let entry_i = 0; entry_i < entriesOfBlog.length; entry_i++) {
			const entry = entriesOfBlog[entry_i];
			const imageurlsOfEntry = imageurls.filter(i => i.blog_id === entry.blog_id && i.entry_id === entry.entry_id);

			const entryOnFS: I.EntryOnFirestore = {
				blogId: blogOnFS.blogId,
				entryCreatedDatetime: entry.entry_created_datetime,
				entryId: String(entry.entry_id),
				entryTitle: entry.entry_title,
				themeId: String(entry.theme_id),
				unitId: unitOnFS.unitId,
			}

			entriesOnFS.push(entryOnFS);

			for (let image_i = 0; image_i < imageurlsOfEntry.length; image_i++) {
				const imageurl = imageurlsOfEntry[image_i];

				const imageurlOnFS: I.ImageUrlOnFirestore = {
					blogId: blogOnFS.blogId,
					entryCreatedDatetime: entryOnFS.entryCreatedDatetime,
					entryId: entryOnFS.entryId,
					imageUrl: imageurl.image_url,
					imageurlId: String(imageurl.image_id),
					themeId: entryOnFS.themeId,
					unitId: unitOnFS.unitId,
				}

				imageurlsOnFS.push(imageurlOnFS);
			}
		}
	}
}
const objOnFSs = {
	unitsOnFS: unitsOnFS,
	blogsOnFS: blogsOnFS,
	themesOnFS: themesOnFS,
	entriesOnFS: entriesOnFS,
	imageurlsOnFS: imageurlsOnFS,
}

fs.writeFileSync("testData.json", JSON.stringify(objOnFSs, undefined, "  "));
