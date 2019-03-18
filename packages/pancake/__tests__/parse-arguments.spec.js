/***************************************************************************************************************************************************************
 *
 * parse-arguments.js unit tests
 *
 * @file - pancake/src/parse-arguments.js
 *
 **************************************************************************************************************************************************************/


const { ParseArgs } = require( '../src/parse-arguments' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// ParseArgs function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test for running a single command
 */
const settings = {
	'npmOrg': '@gov.au @nsw.gov.au',
	'plugins': true,
	'ignorePlugins': [],
};

const argsSingleCommand = [
	'node',
	'pancake',
	'--help',
];

const resultSingleComand = {
	cwd: undefined,
	version: false,
	verbose: false,
	nosave: false,
	set: [],
	org: settings.npmOrg,
	plugins: true,
	ignorePlugins: [],
	help: true,
};

test('Parse args should return correct object for a single command', () => {
	expect( ParseArgs( settings, argsSingleCommand ) ).toMatchObject( resultSingleComand );
});


/**
 * Test for running two commands
 */
const argsTwoCommands = [
	'node',
	'pancake',
	'--help',
	'--noplugins',
];

const resultTwoComands = {
	cwd: undefined,
	version: false,
	verbose: false,
	nosave: false,
	set: [],
	org: settings.npmOrg,
	plugins: false,
	ignorePlugins: [],
	help: true,
};

test('Parse args should return correct object for a single command', () => {
	expect( ParseArgs( settings, argsTwoCommands ) ).toMatchObject( resultTwoComands );
});


/**
 * Test for running all commands
 */
const argsMultiple = [
	'node',
	'pancake',
	'path/file',
	'--set',
	'npmOrg',
	'@yourOrg',
	'--verbose',
	'--version',
	'--nosave',
	'--noplugins',
	'--ignore',
	'@gov.au/pancake-js,@gov.au/pancake-sass',
	'--help',
];

const resultMultiple = {
	cwd: 'path/file',
	version: true,
	verbose: true,
	nosave: true,
	set: [
		'npmOrg',
		'@yourOrg',
	],
	org: settings.npmOrg,
	plugins: false,
	ignorePlugins: [
		'@gov.au/pancake-js',
		'@gov.au/pancake-sass',
	],
	help: true,
};

test('Parse args should return correct object for a single command', () => {
	expect( ParseArgs( settings, argsMultiple ) ).toMatchObject( resultMultiple );
});


/**
 * Test for running all commands as shortcuts
 */
const argsMultipleShort = [
	'node',
	'pancake',
	'path/file',
	'-s',
	'npmOrg',
	'@yourOrg',
	'-v',
	'-V',
	'-n',
	'-p',
	'-i',
	'@gov.au/pancake-js,@gov.au/pancake-sass',
	'-h',
]

test('Parse args should return correct object for a single command', () => {
	expect( ParseArgs( settings, argsMultipleShort ) ).toMatchObject( resultMultiple );
});
