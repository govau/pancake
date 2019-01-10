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
const modulePath = Path.normalize(`${ __dirname }/../../../tests/test1`);
const multipleOrgsPath = Path.normalize(`${ __dirname }/../../../tests/test14`);

const moduleResultObject = [
	{
		'name': '@gov.au/testmodule1',
		'pancake': {
			'pancake-module': {
				'js': {
					'path': 'lib/js/module.js',
				},
				'plugins': [
					'@gov.au/pancake-sass',
					'@gov.au/pancake-js',
				],
				'sass': {
					'path': 'lib/sass/_module.scss',
					'sass-versioning': true,
				},
				'version': '1.0.0',
			},
		},
		'path': `${ modulePath }/node_modules/@gov.au/testmodule1`,
		'peerDependencies': {},
		'version': '11.0.1',
	},
	{
		'name': '@gov.au/testmodule2',
		'pancake': {
			'pancake-module': {
				'js': {
					'path': 'lib/js/module.js',
				},
				'plugins': [
					'@gov.au/pancake-sass',
					'@gov.au/pancake-js',
				],
				'sass': {
					'path': 'lib/sass/_module.scss',
					'sass-versioning': true,
				},
				'version': '1.0.0',
			},
		},
		'path': `${ modulePath }/node_modules/@gov.au/testmodule2`,
		'peerDependencies': {
			'@gov.au/testmodule1': '^11.0.1',
		},
		'version': '13.0.0',
	},
];


const multipleOrgsResultObject = [
	{
		'name': '@gov.au/testmodule1',
		'pancake': {
			'pancake-module': {
				'js': {
					'path': 'lib/js/module.js',
				},
				'plugins': [
					'@gov.au/pancake-sass',
					'@gov.au/pancake-js',
				],
				'sass': {
					'path': 'lib/sass/_module.scss',
					'sass-versioning': true,
				},
				'version': '1.0.0',
			},
		},
		'path': `${ multipleOrgsPath }/node_modules/@gov.au/testmodule1`,
		'peerDependencies': {},
		'version': '11.0.1',
	},
	{
		'name': '@gov.au/testmodule2',
		'pancake': {
			'pancake-module': {
				'js': {
					'path': 'lib/js/module.js',
				},
				'plugins': [
					'@gov.au/pancake-sass',
					'@gov.au/pancake-js',
				],
				'sass': {
					'path': 'lib/sass/_module.scss',
					'sass-versioning': true,
				},
				'version': '1.0.0',
			},
		},
		'path': `${ multipleOrgsPath }/node_modules/@gov.au/testmodule2`,
		'peerDependencies': {
			'@gov.au/testmodule1': '^11.0.1',
		},
		'version': '13.0.0',
	},
	{
		'name': '@nsw.gov.au/testmodule3',
		'pancake': {
			'pancake-module': {
				'js': {
					'path': 'lib/js/module.js',
				},
				'plugins': [
					'@gov.au/pancake-sass',
					'@gov.au/pancake-js',
				],
				'sass': {
					'path': 'lib/sass/_module.scss',
					'sass-versioning': true,
				},
				'version': '1.0.0',
			},
		},
		'path': `${ multipleOrgsPath }/node_modules/@nsw.gov.au/testmodule3`,
		'peerDependencies': {
			'@gov.au/testmodule1': '^11.0.1',
		},
		'version': '13.0.0',
	},
];

test('GetModules should return correct object', () => {
	return GetModules( modulePath, '@gov.au' ).then( data => {
		expect( data ).toMatchObject( moduleResultObject );
	});
});

test('GetModules should return correct object for one orgs with multiple provided', () => {
	return GetModules( modulePath, '@gov.au @nsw.gov.au' ).then( data => {
		expect( data ).toMatchObject( moduleResultObject );
	});
});

test('GetModules should return correct object for multiple orgs', () => {
	return GetModules( multipleOrgsPath, '@gov.au @nsw.gov.au' ).then( data => {
		expect( data ).toMatchObject( multipleOrgsResultObject );
	});
});


/**
 * Test that null is returned if no modules are found
 */
test('GetModules should return nothing if no modules are found', () => {
	console.log = jest.fn();
	console.error = jest.fn();

	return GetModules( modulePath, 'broken' ).then( data => {
		expect( data.length ).toBe( 0 );
	});
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// ReadModule - Read and parse a components package.json file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that correct object is returned when package.json is parsed
 */
const testPath = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule1`);

const resultObject = {
	'name': '@gov.au/testmodule1',
	'version':  '11.0.1',
	'peerDependencies': {},
	'pancake': {
		'pancake-module': {
		'js': {
			'path': 'lib/js/module.js',
		},
		'plugins': [
			'@gov.au/pancake-sass',
			'@gov.au/pancake-js',
		],
		'sass': {
			'path': 'lib/sass/_module.scss',
			'sass-versioning': true,
		},
		'version': '1.0.0',
		}
	},
	'path': testPath,
};

test('ReadModule should return correct object', () => {
	return ReadModule( testPath ).then( data => {
		expect( data ).toMatchObject( resultObject );
	});
});


/**
 * Test that null is returned if no package.json is found
 */
const brokenPath = Path.normalize(`${ __dirname }/./`);

test('ReadModule should return null if package.json is not found', () => {
	return ReadModule( brokenPath ).then( data => {
		expect( data ).toBe( null );
	});
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GetPlugins - Get an object of all plugins for pancake components
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Test that list of plugins is returned as an array
 */

const allModules = [
	{
		'name': '@gov.au/testmodule1',
		'version': '11.0.1',
		'peerDependencies': {},
		'pancake': {
			'pancake-module':{
				'version':'1.0.0',
				'plugins':[
					'@gov.au/pancake-sass',
					'@gov.au/pancake-js',
				],
			},
		},
	},
	{
		'name': '@gov.au/testmodule2',
		'version': '11.0.1',
		'peerDependencies': {},
		'pancake': {
			'pancake-module':{
				'version':'1.0.0',
				'plugins':[
					'@gov.au/pancake-svg',
				],
			},
		},
	},
];

const result = [
	'@gov.au/pancake-sass',
	'@gov.au/pancake-js',
	'@gov.au/pancake-svg',
];

test('GetPlugins should return array of all plugins', () => {
	expect( GetPlugins( allModules ) ).toMatchObject( result );
});


/**
 * Test that function returns false if pancake object isn’t set in package.json
 */
const allModulesError = [
	{
		'name': '@gov.au/testmodule1',
		'version': '11.0.1',
		'peerDependencies': {},
	},
];

test('GetPlugins should return error message and an empty array if pancake object is not defined', () => {
	console.log = jest.fn();
	console.error = jest.fn();

	expect( GetPlugins( allModulesError ).length ).toBe( 0 );
});
