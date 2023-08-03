
import terminal from './terminal.js';
import { trimEnd } from './utils.js';

class Display {
	#element;

	constructor() {
		terminal.on(
			'resize',
			() => {
				if (this.#element) {
					this.#element.width = terminal.width;
					this.#element.height = terminal.height;

					this.render(true);
				}
			},
		);

		terminal.on(
			'key',
			(name) => {
				switch (name) {
					case 'CTRL_C':
						exit();
						break;
					case 'CTRL_R':
						this.render();
						break;
					// no default
				}
			},
		);
	}

	#linesCache = [];
	render(force = false) {
		if (this.#element) {
			const lines = this.#element.render({
				width: terminal.width,
				height: terminal.height,
			});

			this.#linesCache.splice(lines.length);

			for (let index = 0; index < terminal.height; index++) {
				terminal.moveTo(1, index + 1);

				if (index < lines.length) {
					const line = trimEnd(lines[index]);
					if (force || this.#linesCache[index] !== line) {
						terminal.eraseLine();
						this.#linesCache[index] = line;
						terminal(line);
					}
				}
				else {
					terminal.eraseDisplayBelow();
					break;
				}
			}
		}
	}

	setRootElement(element) {
		this.#element?.unmount();
		this.#element = element;
		this.render();
	}
}

const display = new Display();
export default display;

export function exit() {
	terminal.hideCursor(false);
	terminal.clear();
	terminal.processExit();
}
