
import TerminalKit from 'terminal-kit';

const { terminal } = TerminalKit;
export default terminal;

terminal.fullscreen(true);
terminal.grabInput(true);
terminal.hideCursor(true);
