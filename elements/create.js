
import chalk from 'chalk';

import Element             from '../element.js';
import display             from '../display.js';
import {
	bookmarks,
	addBookmark,
	updateBookmark }       from '../state.js';
import { stringWithWidth } from '../utils.js';

import InputElement from './input.js';
import ListElement  from './list.js';

const FIELDS = [
	'Name',
	'Host',
	'Port',
	'User',
	'Identity file',
];

export default class CreateElement extends Element {
	#title = 'New bookmark';
	#title_buttons = '[Esc] Cancel  [Enter] Save';

	constructor(options) {
		super(options);

		let bookmark = bookmarks[this.properties.bookmark_id];
		if (this.properties.bookmark_id) {
			bookmark = bookmarks[this.properties.bookmark_id];
			this.#title = `Edit ${bookmark.name}`;
		}
		else if (this.properties.bookmark_to_clone) {
			bookmark = this.properties.bookmark_to_clone;
			this.#title = `Clone ${bookmark.name}`;
		}

		this.on(
			'key',
			(name) => {
				switch (name) {
					case 'ESCAPE':
						this.#exit();
						break;
					case 'TAB': {
						const element_focused_index = this.child_elements.findIndex(
							(element) => element.focused,
						);
						if (element_focused_index !== -1 && element_focused_index < this.child_elements.length - 1) {
							this.child_elements[element_focused_index].focused = false;
							this.child_elements[element_focused_index + 1].focused = true;
						}
						display.render();
					} break;
					case 'SHIFT_TAB': {
						const element_focused_index = this.child_elements.findIndex(
							(element) => element.focused,
						);
						if (element_focused_index !== -1 && element_focused_index > 0) {
							this.child_elements[element_focused_index].focused = false;
							this.child_elements[element_focused_index - 1].focused = true;
						}
						display.render();
					} break;
					case 'ENTER': {
						const bookmark = {
							name: this.child_elements[0].properties.value,
							host: this.child_elements[1].properties.value,
							port: this.child_elements[2].properties.value,
							user: this.child_elements[3].properties.value,
							identity_file: this.child_elements[4].properties.value,
						};

						let bookmark_id_new;
						if (this.properties.bookmark_id) {
							updateBookmark(
								this.properties.bookmark_id,
								bookmark,
							);
						}
						else {
							bookmark_id_new = addBookmark(bookmark);
						}

						this.#exit(bookmark_id_new);
					} break;
					// no default
				}
			},
		);

		this.append(
			new InputElement({
				value: bookmark?.name ?? '',
			}),
			new InputElement({
				value: bookmark?.host ?? '',
			}),
			new InputElement({
				value: bookmark?.port ?? '22',
			}),
			new InputElement({
				value: bookmark?.user ?? '',
			}),
			new InputElement({
				value: bookmark?.identity_file ?? '',
			}),
		);

		this.child_elements[0].focused = true;
	}

	#exit(bookmark_id_focused) {
		this.parent_element.append(
			new ListElement({
				bookmark_id_focused: bookmark_id_focused ?? this.properties.bookmark_id,
			}),
		);
		this.parent_element.remove(this);
	}

	#renderTitle() {
		return [
			chalk.bold(this.#title)
			+ ' '.repeat(
				this.width - this.#title.length - this.#title_buttons.length,
			)
			+ this.#title_buttons,
		];
	}

	#labelWidth = 15;
	#textFieldWidth() {
		return Math.min(
			this.width - this.#labelWidth - 1,
			45,
		);
	}

	render() {
		const text_field_width = this.#textFieldWidth();

		for (const child_element of this.child_elements) {
			child_element.width = text_field_width;
		}

		const lines = [
			this.#renderTitle(),
			'',
		];

		for (const [ index, field ] of FIELDS.entries()) {
			const child_element = this.child_elements[index];

			lines.push(
				'',
				`${stringWithWidth(field, this.#labelWidth)} ${child_element.render()}`,
			);
		}

		return lines;
	}
}
