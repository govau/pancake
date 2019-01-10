/***************************************************************************************************************************************************************
 *
 * sass.js unit tests
 *
 * @file - pancake-sass/src/sass.js
 *
 **************************************************************************************************************************************************************/


import { GetPath, GetDependencies, GenerateSass, Sassify } from '../src/sass';
import Path from 'path';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GetPath function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const modules = [
	{
		'name': '@gov.au/testmodule1',
		'version': '11.0.1',
		'peerDependencies': {},
		'pancake': {
			'pancake-module': {
				'version': '1.0.0',
				'plugins': [
					'@gov.au/pancake-sass',
					'@gov.au/pancake-js',
				],
				'sass': {
					'path': 'lib/sass/_module.scss',
					'sass-versioning': true,
				},
				'js': {
					'path': 'lib/js/module.js',
				},
			},
		},
		'path': `${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule1`,
	},
	{
		'name': '@gov.au/testmodule2',
		'version': '13.0.0',
		'peerDependencies': {
			'@gov.au/testmodule1': '^11.0.1',
		},
		'pancake': {
			'pancake-module': {
				'version': '1.0.0',
				'plugins': [
					'@gov.au/pancake-sass',
					'@gov.au/pancake-js',
				],
				'sass': {
					'path': 'lib/sass/_module.scss',
					'sass-versioning': true,
				},
				'js': {
					'path': 'lib/js/module.js',
				},
			},
		},
		'path': `${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule2`,
	},
];

const module = '@gov.au/testmodule2';
const baseLocation = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/@gov.au/`);
const npmOrg = '@gov.au';
const resultPath = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule2/lib/sass/_module.scss`);

test('GetPath should return path for sass partial', () => {
	expect( GetPath( module, modules, baseLocation, npmOrg ) ).toBe( resultPath );
});


test('GetPath should return path for sass partial with multiple orgs', () => {
	expect( GetPath( module, modules, baseLocation, '@gov.au @nsw.gov.au' ) ).toBe( resultPath );
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GetDependencies function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const ResultDependencies = {
	'@gov.au/testmodule1': '^11.0.1',
};

test('GetDependencies should return object of all dependencies', () => {
	expect( GetDependencies( module, modules ) ).toMatchObject( ResultDependencies );
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GenerateSass function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const sassPath = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/`);

const ResultGenerateSass = `@import "${ sassPath }@gov.au/testmodule1/lib/sass/_module.scss";\n` +
	`@import "${ sassPath }@gov.au/testmodule2/lib/sass/_module.scss";\n`;

const Location = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule2`);

test('GenerateSass should return path to sass partial import', () => {
	expect( GenerateSass( Location, module, modules, npmOrg ) ).toBe( ResultGenerateSass );
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Sassify function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const pancakeVersion = require( Path.normalize(`${ __dirname }/../../pancake/package.json`) ).version;
const pancakeSassVersion = require( Path.normalize(`${ __dirname }/../package.json`) ).version;
const cssLocation = Path.normalize(`${ __dirname }/../../../tests/test1/pancake/css/pancake.min.css`);

const settings = {
	'minified': true,
	'modules': false,
	'browsers': [
		'last 2 versions',
		'ie 8',
		'ie 9',
		'ie 10',
	],
	'location': 'pancake/css/',
	'name': 'pancake.min.css',
};

const sass = `/*! PANCAKE v${ pancakeVersion } PANCAKE-SASS v${ pancakeSassVersion } */\n\n` +
	`@import "${ sassPath }sass-versioning/dist/_index.scss";\n\n` +
	`@import "${ sassPath }@gov.au/testmodule1/lib/sass/_module.scss";\n` +
	`@import "${ sassPath }@gov.au/testmodule2/lib/sass/_module.scss";\n\n` +
	`@include versioning-check();\n`;

test('Sassify should resolve promise', () => {
	return Sassify( cssLocation, settings, sass ).then( data => {
		expect( data ).toBe( true );
	});
});
