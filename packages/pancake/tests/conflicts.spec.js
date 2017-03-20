/***************************************************************************************************************************************************************
 *
 * conflicts.js unit tests
 *
 * @file - pancake/src/conflicts.js
 *
 **************************************************************************************************************************************************************/

import { CheckModules } from '../src/conflicts';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CheckModules function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Test for no conflicts
 */
const AllModulesNoConflicts = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {}
	},
	{
		"name": "@gov.au/testmodule2",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.0.1"
		},
	},
	{
		"name": "@gov.au/testmodule3",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.0.1"
		},
	},
]

const ResultNoConflicts = {
	"conflicts": false,
	"message": expect.any(String),
	"module": "",
	"dependencies": {},
}

test('No conflicts between pancake modules should return correct result', () => {
	expect(CheckModules(AllModulesNoConflicts)).toMatchObject(ResultNoConflicts);
});


/**
 * Test for single minor conflict
 */
const AllModulesMinorConflict = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {},
	},
	{
		"name": "@gov.au/testmodule2",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.0.1"
		},
	},
	{
		"name": "@gov.au/testmodule3",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.5.3"
		},
	}
]

const ResultMinorConflict = {
	"conflicts": true,
	"message": expect.any(String),
	"module": "@gov.au/testmodule1",
	"dependencies": {
		"^11.5.3": [
			"@gov.au/testmodule3"
		],
		"^11.0.1": [
			"@gov.au/testmodule2",
		],
	},
}

test('Single minor conflict between pancake modules should return correct result', () => {
	expect(CheckModules(AllModulesMinorConflict)).toMatchObject(ResultMinorConflict);
});


/**
 * Test for multiple minor conflicts
 */
const AllModulesMinorConflicts = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {},
	},
	{
		"name": "@gov.au/testmodule2",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1":"^11.6.2"
		},
	},
	{
		"name": "@gov.au/testmodule3",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.5.3"
		},
	}
]

const ResultMinorConflicts = {
	"conflicts": true,
	"message": expect.any(String),
	"module": "@gov.au/testmodule1",
	"dependencies": {
		"^11.5.3": [
			"@gov.au/testmodule3"
		],
		"^11.6.2": [
			"@gov.au/testmodule2",
		],
	},
}

test('Multiple minor conflicts between pancake modules should return correct result', () => {
	expect(CheckModules(AllModulesMinorConflicts)).toMatchObject(ResultMinorConflicts);
});


/**
 * Test for single major conflict due to breaking change module update
 */
const AllModulesMajorConflict = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {},
	},
	{
		"name": "@gov.au/testmodule2",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.0.1"
		},
	},
	{
		"name": "@gov.au/testmodule3",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^10.0.1"
		},
	},
]

const ResultMajorConflict = {
	"conflicts": true,
	"message": expect.any(String),
	"module": "@gov.au/testmodule1",
	"dependencies": {
		"^10.0.1": [
			"@gov.au/testmodule3"
		],
		"^11.0.1": [
			"@gov.au/testmodule2",
		],
	},
}

test('Single major conflict between pancake modules should return correct result', () => {
	expect(CheckModules(AllModulesMajorConflict)).toMatchObject(ResultMajorConflict);
});


/**
 * Test for multiple major conflicts due to multiple breaking change module updates
 */
const AllModulesMajorConflicts = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {},
	},
	{
		"name": "@gov.au/testmodule2",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.0.1"
		},
	},
	{
		"name": "@gov.au/testmodule3",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^10.0.1"
		},
	},
	{
		"name": "@gov.au/testmodule4",
		"version": "11.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^9.0.1"
		},
	},
]

const ResultMajorConflicts = {
	"conflicts": true,
	"message": expect.any(String),
	"module": "@gov.au/testmodule1",
	"dependencies": {
		"^10.0.1": [
			"@gov.au/testmodule3"
		],
		"^11.0.1": [
			"@gov.au/testmodule2",
		],
		"^9.0.1": [
			"@gov.au/testmodule4"
		],
	}
}

test('Multiple major conflicts between pancake modules should return correct result', () => {
	expect(CheckModules(AllModulesMajorConflicts)).toMatchObject(ResultMajorConflicts);
});
