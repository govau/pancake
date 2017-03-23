/***************************************************************************************************************************************************************
 *
 * js.js unit tests
 *
 * @file - pancake-js/src/js.js
 *
 **************************************************************************************************************************************************************/

import { MinifyJS } from '../src/js.js';
import Path from 'path';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// MinifyJS function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Js = "var x = 2; var y = z;";
const File = Path.normalize(`${ __dirname }/../../../tests/test2/node_modules/@gov.au/testmodule2/lib/js/module.js`);
const JsMinified = "var x=2,y=z;";

test('MinifyJs should return minified JS', () => {
	expect( MinifyJS( Js, File ) ).toBe( JsMinified );
});


const JsError = "const x => ( y, z ) { return 'This shouldnt work' }"; // MinifyJs cannot understand ES6
console.log = jest.fn();
console.error = jest.fn();

test('MinifyJs should return same JS if it cannot minify the file', () => {
	expect( MinifyJS( JsError, File ) ).toBe( JsError );
});
