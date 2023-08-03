
import display  from './display.js';
import terminal from './terminal.js';

export default class Element {
	width = terminal.width;
	height = terminal.height;
	child_elements = [];
	properties;

	constructor({
		child_elements = [],
		...properties
	} = {}) {
		this.append(...child_elements);

		this.properties = properties;
	}

	append(...elements) {
		for (const element of elements) {
			this.child_elements.push(element);
			element.parent_element = this;
		}

		display.render();
	}

	remove(element) {
		const index = this.child_elements.indexOf(element);
		if (index !== -1) {
			this.child_elements.splice(index, 1);
			element.parent_element = null;

			element.unmount();

			display.render();
		}
	}

	#listeners = [];

	on(event, callback) {
		this.#listeners.push([
			event,
			callback,
		]);

		terminal.on(
			event,
			callback,
		);
	}

	unmount() {
		while (this.#listeners.length > 0) {
			terminal.off(
				...this.#listeners.pop(),
			);
		}

		for (const child_element of this.child_elements) {
			child_element.unmount();
		}
	}
}
