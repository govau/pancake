/***************************************************************************************************************************************************************
 *
 * modules.js unit tests
 *
 * @file - pancake/src/modules.js
 *
 **************************************************************************************************************************************************************/

import { GetModules, GetPlugins, ReadModule } from '../src/modules';
import Path from 'path';

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GetModules - Get all pancake modules inside a specified folder
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that correct object is returned when package.json is parsed
 */

const ModulePath = Path.normalize(`${ __dirname }/../../../tests/test1`);

const ModuleResultObject = [
	{
		"name": "@gov.au/testmodule1",
		"pancake": {
			"pancake-module": {
				"js": {
					"path": "lib/js/module.js"
				},
				"plugins": [
					"@gov.au/pancake-sass",
					"@gov.au/pancake-js"
				],
				"sass": {
					"path": "lib/sass/_module.scss",
					"sass-versioning": true
				},
				"version": "1.0.0"
			}
		},
		"path": `${ ModulePath }/node_modules/@gov.au/testmodule1`,
		"peerDependencies": {},
		"version": "11.0.1"
	},
	{
		"name": "@gov.au/testmodule2",
		"pancake": {
			"pancake-module": {
				"js": {
					"path": "lib/js/module.js"
				},
				"plugins": [
					"@gov.au/pancake-sass",
					"@gov.au/pancake-js"
				],
				"sass": {
					"path": "lib/sass/_module.scss",
					"sass-versioning": true
				},
				"version": "1.0.0"
			}
		},
		"path": `${ ModulePath }/node_modules/@gov.au/testmodule2`,
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.0.1"
		},
		"version": "13.0.0"
	}
]

test('GetModules should return correct object', () => {
	return GetModules(ModulePath, '@gov.au').then(data => {
		expect(data).toMatchObject(ModuleResultObject);
	});
});


/**
 * Test that null is returned if no modules are found
 */
/*
// todo - this function returns an empty array after displying error message (how do we test that?)
// I think we should return false outside of the map
test('GetModules should return null if no modules are found', () => {
	return GetModules(ModulePath, 'broken').then(data => {
		expect(data).toBe(true);
	});
});
 */

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// ReadModule - Read and parse a componets package.json file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that correct object is returned when package.json is parsed
 */

const TestPath = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule1`);

const ResultObject = {
	"name": "@gov.au/testmodule1",
	"version":  "11.0.1",
	"peerDependencies": {},
	"pancake": {
		"pancake-module": {
		"js": {
			"path": "lib/js/module.js",
		},
		"plugins": [
			"@gov.au/pancake-sass",
			"@gov.au/pancake-js",
		],
		"sass": {
			"path": "lib/sass/_module.scss",
			"sass-versioning": true,
		},
		"version": "1.0.0",
		}
	},
	"path": TestPath,
}

test('ReadModule should return correct object', () => {
  return ReadModule(TestPath).then(data => {
		expect(data).toMatchObject(ResultObject);
  });
});


/**
 * Test that null is returned if no package.json is found
 */
const BrokenPath = Path.normalize(`${ __dirname }/./`);

// this also returns an empty array, same as bottom
/*
test('ReadModule should return null if package.json is not found', () => {
	return ReadModule(BrokenPath).then(data => {
		expect(data).toBe(null);
	});
});
*/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GetPlugins - Get an object of all plugins for pancake components
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that list of plugins is returned as an array
 */

const AllModules = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {},
		"pancake": {
			"pancake-module":{
				"version":"1.0.0",
				"plugins":[
					"@gov.au/pancake-sass",
					"@gov.au/pancake-js"
				],
			}
		},
	},
	{
		"name": "@gov.au/testmodule2",
		"version": "11.0.1",
		"peerDependencies": {},
		"pancake": {
			"pancake-module":{
				"version":"1.0.0",
				"plugins":[
					"@gov.au/pancake-svg",
				],
			}
		},
	},
]

const Result = [
	"@gov.au/pancake-sass",
	"@gov.au/pancake-js",
	"@gov.au/pancake-svg",
]

test('GetPlugins should return array of all plugins', () => {
	expect(GetPlugins(AllModules)).toMatchObject(Result);
});

/**
 * Test that function returns false if pancake object isn't set in package.json
 */

const AllModulesError = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {},
	},
]

// todo - this function returns an empty array after displying error message (how do we test that?)
// I think we should return false outside of the map
/*
test('GetPlugins should return error message if pancake object is not defined', () => {
	expect(GetPlugins(AllModulesError)).toBe(false)
});*/
