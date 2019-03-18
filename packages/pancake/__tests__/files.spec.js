/***************************************************************************************************************************************************************
 *
 * files.js unit tests
 *
 * @file - pancake/src/files.js
 *
 **************************************************************************************************************************************************************/


const { GetFolders, ReadFile, CreateDir } = require( '../src/files' );
const Path = require( 'path' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all folders inside a folder
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that correct array is returned when function runs
 */
const modulePath = Path.normalize(`${ __dirname }/../../../tests/test5/node_modules/@gov.au`);

const result = [
	Path.normalize(`${ __dirname }/../../../tests/test5/node_modules/@gov.au/pancake`),
	Path.normalize(`${ __dirname }/../../../tests/test5/node_modules/@gov.au/pancake-js`),
	Path.normalize(`${ __dirname }/../../../tests/test5/node_modules/@gov.au/pancake-sass`),
	Path.normalize(`${ __dirname }/../../../tests/test5/node_modules/@gov.au/testmodule1`),
	Path.normalize(`${ __dirname }/../../../tests/test5/node_modules/@gov.au/testmodule2`),
	Path.normalize(`${ __dirname }/../../../tests/test5/node_modules/@gov.au/testmodule3`),
]

test('ModulePath should return array of all folders in path', () => {
	expect( GetFolders( modulePath ) ).toMatchObject( result );
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Read file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that ReadFile correctly returns file content
 */
const location = Path.normalize(`${ __dirname }/../../../tests/test2/package.json`);

const data = {
	'pancake': {
		'auto-save': false,
		'css': {
			'minified': true,
			'modules': true,
			'browsers': [
				'last 2 versions',
				'ie 8',
				'ie 9',
				'ie 10',
			],
			'location': 'pancake/css/',
			'name': 'pancake.min.css',
		},
		'sass': {
			'name': false,
		},
		'js': {
			'minified': true,
			'modules': true,
			'location': 'pancake/js/',
			'name': 'pancake.min.js',
		},
	},
}

const content = `${ JSON.stringify( data, null, '\t' ) }\n`;

test('ReadFile should return correct information', () => {
	return ReadFile( location ).then( data => {
		expect( data ).toBe( content );
	});
});
