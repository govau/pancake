/***************************************************************************************************************************************************************
 *
 * parse-arguments.js unit tests
 *
 * @file - pancake/src/parse-arguments.js
 *
 **************************************************************************************************************************************************************/

import { ParseArgs } from '../src/parse-arguments';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// ParseArgs function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test for running a single command
 */

const Settings = {
	"npmOrg": "@gov.au",
	"plugins": true,
	"ignorePlugins": []
}

const ArgsSingleCommand = [
	"node",
	"pancake",
	"--help"
]

const ResultSingleComand = {
	cwd: undefined,
	version: false,
	verbose: false,
	nosave: false,
	set: [],
	org: Settings.npmOrg,
	plugins: true,
	ignorePlugins: [],
	help: true,
};

test('Parse args should return correct object for a single command', () => {
	expect(ParseArgs( Settings, ArgsSingleCommand )).toMatchObject(ResultSingleComand);
});


/**
 * Test for running two commands
 */

const ArgsTwoCommands = [
	"node",
	"pancake",
	"--help",
	"--noplugins"
]

const ResultTwoComands = {
	cwd: undefined,
	version: false,
	verbose: false,
	nosave: false,
	set: [],
	org: Settings.npmOrg,
	plugins: false,
	ignorePlugins: [],
	help: true,
};

test('Parse args should return correct object for a single command', () => {
	expect(ParseArgs( Settings, ArgsTwoCommands )).toMatchObject(ResultTwoComands);
});


/**
 * Test for running all commands
 */

const ArgsMultiple = [
	"node",
	"pancake",
	"path/file",
	"--set",
	"npmOrg",
	"@yourOrg",
	"--verbose",
	"--version",
	"--nosave",
	"--noplugins",
	"--ignore",
	"@gov.au/pancake-js,@gov.au/pancake-sass",
	"--help",
]

const ResultMultiple = {
	cwd: "path/file",
	version: true,
	verbose: true,
	nosave: true,
	set: [
		"npmOrg",
		"@yourOrg"
	],
	org: Settings.npmOrg,
	plugins: false,
	ignorePlugins: [
		"@gov.au/pancake-js",
		"@gov.au/pancake-sass",
	],
	help: true,
};

test('Parse args should return correct object for a single command', () => {
	expect(ParseArgs( Settings, ArgsMultiple )).toMatchObject(ResultMultiple);
});


/**
 * Test for running all commands as shortcuts
 */

const ArgsMultipleShort = [
	"node",
	"pancake",
	"path/file",
	"-s",
	"npmOrg",
	"@yourOrg",
	"-v",
	"-V",
	"-n",
	"-p",
	"-i",
	"@gov.au/pancake-js,@gov.au/pancake-sass",
	"-h",
]

test('Parse args should return correct object for a single command', () => {
	expect(ParseArgs( Settings, ArgsMultipleShort )).toMatchObject(ResultMultiple);
});
