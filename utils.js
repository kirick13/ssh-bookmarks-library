
import terminalKit from 'terminal-kit';

export function stringWithWidth(string, width, no_ellipsis = false) {
	const string_length = terminalKit.stringWidth(string);

	if (string_length > width) {
		return string.slice(0, width - 1) + (no_ellipsis ? '' : '…');
	}

	return string + ' '.repeat(width - string_length);
}

export function trimEnd(string) {
	return string.replace(/\s+$/, '');
}
