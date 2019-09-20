//#region on csv
export interface UnitOnCsv {
	unit_id: number,
	screen_name: string,
	unit_name: string,
}

export interface BlogOnCsv {
	blog_id: number,
	ameba_id: string,
	unit_id: number,
	blog_title: string,
}

export interface ThemeOnCsv {
	blog_id: number,
	theme_id: number,
	theme_name: string,
}

export interface EntryOnCsv {
	blog_id: number,
	entry_id: number,
	entry_title: string,
	entry_created_datetime: string,
	theme_id: number,
}

export interface ImageUrlOnCsv {
	blog_id: number,
	image_id: number,
	image_url: string,
	entry_id: number,
}

//#endregion

//#region on Firestore
export interface UnitOnFirestore {
	/** FirestoreのDocumentID。 */
	unitId: string,

	/** ユニット名称。 */
	unitName: string,
}

export interface BlogOnFirestore {
	/** FirestoreのDocumentID。 */
	blogId: string,

	/** 上位unitsのDocumentID。 */
	unitId: string,

	/** ブログタイトル。 */
	blogTitle: string,

	/** 下位のentriesの最終エントリー作成日時 */
	lastEntryCreatedDatetime:string,
}

export interface ThemeOnFirestore {
	/** FirestoreのDocumentID。 */
	themeId: string,

	/** 上位unitsのDocumentID。 */
	unitId: string,

	/** 上位blogsのDocumentID。 */
	blogId: string,

	/** テーマ名称。 */
	themeName: string,
}

export interface EntryOnFirestore {
	/** FirestoreのDocumentID。 */
	entryId: string,

	/** 上位unitsのDocumentID。 */
	unitId: string,

	/** 上位blogsのDocumentID。 */
	blogId: string,

	/** 該当するthemesのDocumentID。 */
	themeId: string,

	/** エントリータイトル。 */
	entryTitle: string,

	/** エントリー作成日時。 */
	entryCreatedDatetime: string,
}

export interface ImageUrlOnFirestore {
	/** FirestoreのDocumentID。 */
	imageurlId: string,

	/** 上位unitsのDocumentID。 */
	unitId: string,

	/** 上位blogsのDocumentID。 */
	blogId: string,

	/** 上位entriesのtheme_id。 */
	themeId: string,

	/** 上位entriesのDocumentID。 */
	entryId: string,

	/** 画像URL。 */
	imageUrl: string,

	/** 上位entriesのentry_created_datetime */
	entryCreatedDatetime: string,
}
//#endregion