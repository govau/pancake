/***************************************************************************************************************************************************************
 *
 * modules.js unit tests
 *
 * @file - pancake/src/modules.js
 *
 **************************************************************************************************************************************************************/

import { GetModules, GetPlugins } from '../src/modules';

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GetPlugins - Get an object of all plugins for pancake components
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test for no conflicts
 */
const PancakeConfig = {
	"pancake-module":{
		"version":"1.0.0",
		"plugins":[
			"@gov.au/pancake-sass",
			"@gov.au/pancake-js"
		],
	}
}

const AllModulesNoConflicts = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {},
		"pancake": PancakeConfig,
	},
]

const ResultNoConflicts = [
	"@gov.au/pancake-sass",
	"@gov.au/pancake-js",
]

test('GetPlugins should return array of plugins', () => {
	expect(GetPlugins(AllModulesNoConflicts)).toMatchObject(ResultNoConflicts);
});
