/***************************************************************************************************************************************************************
 *
 * js.js unit tests
 *
 * @file - pancake-js/src/js.js
 *
 **************************************************************************************************************************************************************/

import { MinifyJS, HandelJS, MinifyAllJS } from '../src/js.js';
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


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// HandleJS function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const From = Path.normalize(`${ __dirname }/../../../tests/test2/node_modules/@gov.au/testmodule1/lib/js/module.js`);
const Settings = {
	"minified": true,
	"modules": true,
	"location": "pancake/js/",
	"name": "pancake.min.js"
}
const To = Path.normalize(`${ __dirname }/../../../tests/test2/pancake/js/testmodule1.js`);
const Tag = '@gov.au/testmodule1 v11.0.1'
const Result = '/*! @gov.au/testmodule1 v11.0.1 */confirm(\"testmodule1:v11.0.1\");'

test('HandelJS should return minified code from specified path', () => {
	return HandelJS( From, Settings, To, Tag ).then( data => {
		expect( data ).toBe( Result );
	});
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// MinifyAllJS function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Version = '1.0.8'
const AllJS = []
const SettingsAllJS = {
	"minified": true,
	"modules": true,
	"location": "pancake/js/",
	"name": "pancake.min.js"
}
const PkgPath = Path.normalize(`${ __dirname }/../../../tests/test2`);

test('MinifyAllJS should resolve promise', () => {
	return MinifyAllJS( Version, AllJS, SettingsAllJS, PkgPath ).then( data => {
		expect( data ).toBe( true );
	});
});
