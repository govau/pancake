/***************************************************************************************************************************************************************
 *
 * js.js unit tests
 *
 * @file - pancake-js/src/js.js
 *
 **************************************************************************************************************************************************************/


import { MinifyJS, HandleJS, MinifyAllJS } from '../src/js.js';
import Path from 'path';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// MinifyJS function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const js = `var x = 2; var y = z;`;
const file = Path.normalize(`${ __dirname }/../../../tests/test2/node_modules/@gov.au/testmodule2/lib/js/module.js`);
const jsMinified = `var x=2,y=z;`;

test('MinifyJs should return minified JS', () => {
	expect( MinifyJS( js, file ) ).toBe( jsMinified );
});


const jsError = `const x => ( y, z ) { return "This shouldn't work" }`; // MinifyJs cannot understand ES6

test('MinifyJs should return same JS if it cannot minify the file', () => {
	console.log = jest.fn();
	console.error = jest.fn();

	expect( MinifyJS( jsError, file ) ).toBe( jsError );
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// HandleJS function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const from = Path.normalize(`${ __dirname }/../../../tests/test2/node_modules/@gov.au/testmodule1/lib/js/module.js`);
const settings = {
	'minified': true,
	'modules': true,
	'location': 'pancake/js/',
	'name': 'pancake.min.js',
};
const to = Path.normalize(`${ __dirname }/../../../tests/test2/pancake/js/testmodule1.js`);
const tag = '@gov.au/testmodule1 v11.0.1';
const result = '/*! @gov.au/testmodule1 v11.0.1 */confirm(\"testmodule1:v11.0.1\");';

test('HandleJS should return minified code from specified path', () => {
	return HandleJS( from, settings, to, tag ).then( data => {
		expect( data ).toBe( result );
	});
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// MinifyAllJS function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const version = '1.0.8';
const allJS = [];
const settingsAllJS = {
	'minified': true,
	'modules': true,
	'location': 'pancake/js/',
	'name': 'pancake.min.js',
};
const pkgPath = Path.normalize(`${ __dirname }/../../../tests/test2`);

test('MinifyAllJS should resolve promise', () => {
	return MinifyAllJS( version, allJS, settingsAllJS, pkgPath ).then( data => {
		expect( data ).toBe( true );
	});
});
