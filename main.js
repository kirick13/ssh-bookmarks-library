
import { writeFileSync } from 'node:fs';

import display      from './display.js';
import BoxElement   from './elements/box.js';
// import HelloElement from './elements/hello.js';
import ListElement  from './elements/list.js';
import terminal     from './terminal.js';

terminal.windowTitle('SSH Bookmarks Library');

writeFileSync(
	process.argv[2],
	'',
);

display.setRootElement(
	new BoxElement({
		child_elements: [
			new ListElement(),
		],
	}),
);
