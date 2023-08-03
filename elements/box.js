
import Element  from '../element.js';
import { stringWithWidth } from '../utils.js';

export default class BoxElement extends Element {
	render() {
		const [ child_element ] = this.child_elements;
		child_element.width = this.width - 4;
		child_element.height = this.height - 2;

		const child_element_lines = child_element.render();

		const lines = [
			'┌' + '─'.repeat(this.width - 2) + '┐',
		];

		for (let index = 0; index < this.height - 2; index++) {
			if (index < child_element_lines.length) {
				const line = child_element_lines[index];
				lines.push(`│ ${stringWithWidth(line, child_element.width)} │`);
			}
			else {
				lines.push(`│ ${' '.repeat(this.width - 4)} │`);
			}
		}

		lines.push(`└${'─'.repeat(this.width - 2)}┘`);

		return lines;
	}
}
