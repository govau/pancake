/***************************************************************************************************************************************************************
 *
 * Ansi escape color codes
 *
 * @file         - pancake/src/logging.js
 * @description  - This function adds colour to a string
 *
 **************************************************************************************************************************************************************/

import { Style } from '../src/logging';


test('undefined string in argument should return empty string', () => {
	expect(Style.black()).toBe('');
	expect(Style.red()).toBe('');
	expect(Style.green()).toBe('');
	expect(Style.yellow()).toBe('');
	expect(Style.blue()).toBe('');
	expect(Style.magenta()).toBe('');
	expect(Style.cyan()).toBe('');
	expect(Style.white()).toBe('');
	expect(Style.gray()).toBe('');
	expect(Style.bold()).toBe('');
});
