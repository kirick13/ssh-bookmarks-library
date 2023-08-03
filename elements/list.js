
import { writeFileSync } from 'node:fs';
import chalk             from 'chalk';

import display, { exit } from '../display.js';
import Element           from '../element.js';
import {
	bookmarks,
	bookmarks_order,
	moveBookmarkDown,
	moveBookmarkUp,
	removeBookmark  }    from '../state.js';
import {
    stringWithWidth }    from '../utils.js';

import CreateElement     from './create.js';

export default class ListElement extends Element {
	#title = 'Bookmarks';
	#title_buttons = {
		N: 'New Bookmark',
		E: 'Edit',
		C: 'Clone',
		R: 'Reorder',
		Del: 'Delete',
		Enter: 'Connect',
	};

	#mode = null;

	constructor(options) {
		super(options);

		if (this.properties.bookmark_id_focused) {
			const bookmark_index = bookmarks_order.indexOf(
				this.properties.bookmark_id_focused,
			);

			if (bookmark_index !== -1) {
				this.#listIndexFocused = bookmark_index;
			}
		}

		this.on(
			'key',
			(name) => {
				// this.#title = `Bookmarks (${name})`;
				// display.render();

				switch (name) {
					case 'ENTER':
						return this.#onKeyEnter();
					case 'ESCAPE':
						this.#mode = null;
						display.render();
						break;
					case 'UP':
						return this.#onKeyUp();
					case 'DOWN':
						return this.#onKeyDown();
					case 'DELETE':
						return this.#onKeyDelete();
					case 'c':
					case 'C':
						this.parent_element.append(
							new CreateElement({
								bookmark_to_clone: bookmarks[bookmarks_order[this.#listIndexFocused]],
							}),
						);
						this.parent_element.remove(this);
						break;
					case 'e':
					case 'E':
						this.parent_element.append(
							new CreateElement({
								bookmark_id: bookmarks_order[this.#listIndexFocused],
							}),
						);
						this.parent_element.remove(this);
						break;
					case 'n':
					case 'N':
						this.parent_element.append(
							new CreateElement(),
						);
						this.parent_element.remove(this);
						break;
					case 'r':
					case 'R':
						return this.#onKeyR();
					// no default
				}
			},
		);
	}

	#onKeyEnter() {
		switch (this.#mode) {
			case 'delete':
				removeBookmark(
					bookmarks_order[this.#listIndexFocused],
				);

				if (this.#listIndexFocused >= bookmarks_order.length) {
					this.#listIndexFocused = Math.max(
						0,
						bookmarks_order.length - 1,
					);
				}

				this.#mode = null;
				break;
			case null: {
				const {
					host,
					port,
					user,
					identity_file,
				} = bookmarks[bookmarks_order[this.#listIndexFocused]];

				writeFileSync(
					process.argv[2],
					`-i ${identity_file} ${user}@${host} -p ${port}`,
				);

				return exit();
			}
			default:
				return;
		}

		display.render();
	}

	#onKeyUp() {
		switch (this.#mode) {
			case 'reorder':
				if (this.#listIndexFocused > 0) {
					moveBookmarkUp(
						bookmarks_order[this.#listIndexFocused],
					);

					this.#listIndexFocused--;
				}
				break;
			case null:
				this.#listIndexFocused = Math.max(
					0,
					this.#listIndexFocused - 1,
				);
				break;
			default:
				return;
		}

		display.render();
	}

	#onKeyDown() {
		switch (this.#mode) {
			case 'reorder':
				if (this.#listIndexFocused < bookmarks_order.length - 1) {
					// const [ bookmark_id ] = bookmarks_order.splice(
					// 	this.#listIndexFocused,
					// 	1,
					// );

					// bookmarks_order.splice(
					// 	this.#listIndexFocused + 1,
					// 	0,
					// 	bookmark_id,
					// );

					moveBookmarkDown(
						bookmarks_order[this.#listIndexFocused],
					);

					this.#listIndexFocused++;
				}
				break;
			case null:
				this.#listIndexFocused = Math.min(
					bookmarks_order.length - 1,
					this.#listIndexFocused + 1,
				);
				break;
			default:
				return;
		}

		display.render();
	}

	#onKeyDelete() {
		if (this.#mode === null) {
			this.#mode = 'delete';
			display.render();
		}
	}

	#onKeyR() {
		if (this.#mode === null) {
			this.#mode = 'reorder';
			display.render();
		}
	}

	#getColumnsWidth() {
		const type_width = 3;
		const host_width = Math.round(this.width * 0.35);
		const user_width = Math.round(this.width * 0.25);

		return {
			type: type_width,
			name: this.width - type_width - host_width - user_width - 3, // gaps
			host: host_width,
			user: user_width,
		};
	}

	#renderTitle() {
		let title_buttons = '';
		switch (this.#mode) {
			case 'delete':
				title_buttons = '[Enter] Delete  [Esc] Cancel';
				break;
			case 'reorder':
				title_buttons = '[Esc] Exit reorder';
				break;
			default:
				title_buttons = Object.entries(this.#title_buttons).map(
					([ key, value ]) => `[${key}] ${value}`,
				).join('  ');
		}

		return [
			chalk.bold(this.#title)
			+ ' '.repeat(
				this.width - this.#title.length - title_buttons.length,
			)
			+ title_buttons,
		];
	}

	#renderListHeader() {
		const column_widths = this.#getColumnsWidth();

		return [
			'',
			[
				stringWithWidth('', column_widths.type),
				chalk.bold(
					stringWithWidth('Name', column_widths.name),
				),
				chalk.bold(
					stringWithWidth('Host', column_widths.host),
				),
				chalk.bold(
					stringWithWidth('User', column_widths.user),
				),
			].join(' '),
			'─'.repeat(this.width),
		];
	}

	#listIndexStart = 0;
	#listIndexFocused = 0;

	#getRenderRange() {
		const rows_limit = this.height - 4;

		if (this.#listIndexFocused < this.#listIndexStart) {
			this.#listIndexStart = this.#listIndexFocused;
		}

		if (this.#listIndexFocused >= this.#listIndexStart + rows_limit) {
			this.#listIndexStart = this.#listIndexFocused - rows_limit + 1;
		}

		return [
			this.#listIndexStart,
			this.#listIndexStart + rows_limit,
		];
	}

	#renderList() {
		if (bookmarks_order.length === 0) {
			return [
				'',
				'No bookmarks.',
				'Press [N] to create a new one.',
			];
		}

		const column_widths = this.#getColumnsWidth();

		const [
			index_start,
			index_end,
		] = this.#getRenderRange();

		const lines = [];

		for (let index = index_start; index < index_end; index++) {
			const bookmark_id = bookmarks_order[index];
			const bookmark = bookmarks[bookmark_id];

			if (!bookmark) {
				break;
			}

			let line = [
				stringWithWidth(
					' 🌐',
					column_widths.type,
				),
				stringWithWidth(
					bookmark.name,
					column_widths.name,
				),
				stringWithWidth(
					`${bookmark.host}${bookmark.port === 22 ? '' : `:${bookmark.port}`}`,
					column_widths.host,
				),
				stringWithWidth(
					bookmark.user,
					column_widths.user,
				),
			].join(' ');

			if (index === this.#listIndexFocused) {
				switch (this.#mode) {
					case 'reorder':
						line = chalk.bgBlue(line);
						break;
					case 'delete':
						line = chalk.bgRed(line);
						break;
					default:
						line = chalk.bgWhite.black(line);
				}
			}

			lines.push(line);
		}

		return lines;
	}

	render() {
		return [
			...this.#renderTitle(),
			...this.#renderListHeader(),
			...this.#renderList(),
		];
	}
}
