/***************************************************************************************************************************************************************
 *
 * react.js unit tests
 *
 * @file - pancake-js/src/react.js
 *
 **************************************************************************************************************************************************************/

const { HandleReact } = require( '../src/react.js' );
const Path = require( 'path' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// HandleReact function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const from = Path.normalize(`${ __dirname }/../../../tests/test10/node_modules/@gov.au/testmodule1/lib/js/react.js`);
const to = Path.normalize(`${ __dirname }/../../../tests/test10/pancake/react/testmodule1.js`);
const tag = '@gov.au/testmodule1 v11.0.1';
const result = `confirm('testmodule1:v11.0.1');\n`;

test('pancake-react should copy the file and rename it from specified path', () => {
	return HandleReact( from, to, tag ).then( data => {
		expect( data ).toBe( result );
	});
});
