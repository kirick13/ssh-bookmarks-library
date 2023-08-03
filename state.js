
import {
	readFileSync,
	writeFileSync,
} from 'node:fs';
import {
	dirname,
	join as joinPath }  from 'node:path';

import display from './display.js';

const FILENAME = joinPath(
	dirname(
		import.meta.url.replace(/^file:\/\//, ''),
	),
	'bookmarks.json',
);

export const bookmarks = {};
export const bookmarks_order = [];

export function addBookmark(bookmark) {
	bookmark.id = Math.random().toString(36).slice(2);

	bookmarks[bookmark.id] = bookmark;
	bookmarks_order.push(bookmark.id);

	save();

	return bookmark.id;
}

export function updateBookmark(bookmark_id, bookmark) {
	bookmark.id = bookmark_id;
	bookmarks[bookmark_id] = bookmark;

	save();
}

export function removeBookmark(bookmark_id) {
	delete bookmarks[bookmark_id];

	const bookmark_index = bookmarks_order.indexOf(bookmark_id);
	if (bookmark_index !== -1) {
		bookmarks_order.splice(bookmark_index, 1);
	}

	save();
}

export function moveBookmarkUp(bookmark_id) {
	const bookmark_index = bookmarks_order.indexOf(bookmark_id);
	if (
		bookmark_index !== -1
		&& bookmark_index > 0
	) {
		bookmarks_order.splice(
			bookmark_index,
			1,
		);

		bookmarks_order.splice(
			bookmark_index - 1,
			0,
			bookmark_id,
		);

		save();
	}
}

export function moveBookmarkDown(bookmark_id) {
	const bookmark_index = bookmarks_order.indexOf(bookmark_id);
	if (
		bookmark_index !== -1
		&& bookmark_index < bookmarks_order.length - 1
	) {
		bookmarks_order.splice(
			bookmark_index,
			1,
		);

		bookmarks_order.splice(
			bookmark_index + 1,
			0,
			bookmark_id,
		);

		save();
	}
}

function save() {
	writeFileSync(
		FILENAME,
		JSON.stringify(
			bookmarks_order.map(
				(bookmark_id) => bookmarks[bookmark_id],
			),
		),
	);

	display.render();
}

// load
{
	let file_bookmarks_array = [];
	try {
		file_bookmarks_array = JSON.parse(
			readFileSync(FILENAME),
		);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	for (const bookmark of file_bookmarks_array) {
		bookmarks[bookmark.id] = bookmark;
		bookmarks_order.push(bookmark.id);
	}
}
