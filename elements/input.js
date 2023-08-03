
import chalk       from 'chalk';
import terminalKit from 'terminal-kit';

import Element             from '../element.js';
import display             from '../display.js';
import { stringWithWidth } from '../utils.js';

export default class InputElement extends Element {
	focused = false;
	#cursor_position = 0;

	constructor(options) {
		super(options);

		if (typeof this.properties.value !== 'string') {
			this.properties.value = String(this.properties.value);
		}

		this.on(
			'key',
			(name) => {
				if (this.focused) {
					switch (name) {
						case 'LEFT':
							if (this.#cursor_position > 0) {
								if (this.#cursor_position === this.properties.value.length) {
									this.#textRenderFrom = Math.max(
										0,
										this.#textRenderFrom - 1,
									);
								}

								this.#cursor_position--;

								if (this.#cursor_position < this.#textRenderFrom) {
									this.#textRenderFrom = this.#cursor_position;
								}

								display.render();
							}
							break;
						case 'RIGHT':
							if (this.#cursor_position < this.properties.value.length) {
								this.#cursor_position++;

								if (this.#cursor_position >= this.#textRenderFrom + this.width) {
									this.#textRenderFrom = this.#cursor_position - this.width + 1;
								}

								display.render();
							}
							break;
						case 'BACKSPACE':
							if (this.#cursor_position > 0) {
								this.properties.value = this.properties.value.slice(0, this.#cursor_position - 1) + this.properties.value.slice(this.#cursor_position);
								this.#cursor_position--;

								if (this.#cursor_position < this.#textRenderFrom) {
									this.#textRenderFrom = this.#cursor_position;
								}

								if (this.properties.value.length > this.width) {
									this.#textRenderFrom = Math.max(
										0,
										this.#textRenderFrom - 1,
									);
								}
								else {
									this.#textRenderFrom = 0;
								}
							}
							display.render();
							break;
						default:
							if (typeof name === 'string' && name.length === 1) {
								this.properties.value = this.properties.value.slice(0, this.#cursor_position) + name + this.properties.value.slice(this.#cursor_position);
								this.#cursor_position++;

								if (this.#cursor_position >= this.#textRenderFrom + this.width) {
									this.#textRenderFrom = this.#cursor_position - this.width + 1;
								}

								display.render();
							}
					}
				}
			},
		);
	}

	#textRenderFrom = null;

	render() {
		if (this.focused) {
			if (this.#textRenderFrom === null) {
				this.#cursor_position = this.properties.value.length;
				this.#textRenderFrom = Math.max(
					0,
					this.#cursor_position - this.width + 1,
				);
			}

			const value_before_cursor = this.properties.value.slice(
				this.#textRenderFrom,
				this.#cursor_position,
			);
			const value_on_cursor = this.properties.value[this.#cursor_position] ?? ' ';
			const value_after_cursor = this.properties.value.slice(
				this.#cursor_position + 1,
				this.#textRenderFrom + this.width,
			);

			return chalk.bgWhite.black(
				value_before_cursor
				+ chalk.bgBlue.white(value_on_cursor)
				+ stringWithWidth(
					value_after_cursor,
					this.width - terminalKit.stringWidth(value_before_cursor) - 1,
					true,
				),
			);
		}

		this.#textRenderFrom = null;

		const { value } = this.properties;

		return chalk.bgWhite.black(
			value.slice(
				0,
				this.width,
			)
			+ ' '.repeat(
				Math.max(
					0,
					this.width - value.length,
				),
			),
		);
	}
}
