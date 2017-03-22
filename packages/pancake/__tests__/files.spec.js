/***************************************************************************************************************************************************************
 *
 * files.js unit tests
 *
 * @file - pancake/src/files.js
 *
 **************************************************************************************************************************************************************/


//jest.mock('fs');
import { GetFolders, ReadFile, CreateDir } from '../src/files';
import Path from 'path';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all folders inside a folder
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that correct array is returned when function runs
 */
const ModulePath = Path.normalize(`${ __dirname }/../../../tests/test2`);

const Result = [
	"/Users/dtomac2/pancake/tests/test2/fixture",
	"/Users/dtomac2/pancake/tests/test2/node_modules",
	"/Users/dtomac2/pancake/tests/test2/pancake"
]

test('ModulePath should return array of all folders in path', () => {
	expect( GetFolders(ModulePath) ).toMatchObject(Result);
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Read file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that ReadFile correctly returns file content
 */
const Location = Path.normalize(`${ __dirname }/../../../tests/test2/package.json`);

const Data = {
	"pancake": {
		"auto-save": false,
		"css": {
			"minified": true,
			"modules": true,
			"browsers": [
				"last 2 versions",
				"ie 8",
				"ie 9",
				"ie 10"
			],
			"location": "pancake/css/",
			"name": "pancake.min.css"
		},
		"sass": {
			"name": false
		},
		"js": {
			"minified": true,
			"modules": true,
			"location": "pancake/js/",
			"name": "pancake.min.js"
		}
	}
}

const Content = JSON.stringify(Data, null, '\t')+'\n'

test('ReadFile should return correct information', () => {
	return ReadFile(Location).then( data => {
		expect( data ).toBe( Content );
	});
});
