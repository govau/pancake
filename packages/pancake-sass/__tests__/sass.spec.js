/***************************************************************************************************************************************************************
 *
 * conflicts.js unit tests
 *
 * @file - pancake/src/conflicts.js
 *
 **************************************************************************************************************************************************************/

import { GetPath, GetDependencies, GenerateSass, Sassify } from '../src/sass';
import Path from 'path';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GetPath function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Modules = [
	{
		"name": "@gov.au/testmodule1",
		"version": "11.0.1",
		"peerDependencies": {},
		"pancake": {
			"pancake-module": {
				"version": "1.0.0",
				"plugins": [
					"@gov.au/pancake-sass",
					"@gov.au/pancake-js"
				],
				"sass": {
					"path": "lib/sass/_module.scss",
					"sass-versioning": true
				},
				"js": {
					"path": "lib/js/module.js"
				}
			}
		},
		"path": `${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule1`
	},
	{
		"name": "@gov.au/testmodule2",
		"version": "13.0.0",
		"peerDependencies": {
			"@gov.au/testmodule1": "^11.0.1"
		},
		"pancake": {
			"pancake-module": {
				"version": "1.0.0",
				"plugins": [
					"@gov.au/pancake-sass",
					"@gov.au/pancake-js"
				],
				"sass": {
					"path": "lib/sass/_module.scss",
					"sass-versioning": true
				},
				"js": {
					"path": "lib/js/module.js"
				}
			}
		},
		"path": `${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule2`
	}
]

const Module = '@gov.au/testmodule2';
const BaseLocation = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/@gov.au/`);
const npmOrg = '@gov.au';
const ResultPath = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule2/lib/sass/_module.scss`);

test('GetPath should return path for sass partial', () => {
	expect( GetPath( Module, Modules, BaseLocation, npmOrg ) ).toBe(ResultPath);
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GetDependencies function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

const ResultDependencies = {
	"@gov.au/testmodule1": "^11.0.1"
}

test('GetDependencies should return object of all dependencies', () => {
	expect( GetDependencies( Module, Modules ) ).toMatchObject(ResultDependencies);
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GenerateSass function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

const ResultGenerateSass = '@import "/Users/dtomac2/pancake/tests/test1/node_modules/@gov.au/testmodule1/lib/sass/_module.scss";\n' +
'@import "/Users/dtomac2/pancake/tests/test1/node_modules/@gov.au/testmodule2/lib/sass/_module.scss";\n'

const Location = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/@gov.au/testmodule2`);

test('GenerateSass should return path to sass partial import', () => {
	expect( GenerateSass( Location, Module, Modules, npmOrg ) ).toBe(ResultGenerateSass);
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Sassify function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

const CSSLocation = Path.normalize(`${ __dirname }/../../../tests/test1/pancake/css/pancake.min.css`);

const Settings = {
	"minified": true,
	"modules": false,
	"browsers": [
		"last 2 versions",
		"ie 8",
		"ie 9",
		"ie 10"
	],
	"location": "pancake/css/",
	"name": "pancake.min.css"
}

const SassPath = Path.normalize(`${ __dirname }/../../../tests/test1/node_modules/`);

const Sass = '/*! PANCAKE v1.0.8 PANCAKE-SASS v1.0.8 */\n\n' +
'@import "' + SassPath + 'sass-versioning/dist/_index.scss";\n\n' +
'@import "' + SassPath + '@gov.au/testmodule1/lib/sass/_module.scss";\n' +
'@import "' + SassPath + '@gov.au/testmodule2/lib/sass/_module.scss";\n\n'
'@include versioning-check();\n'

test('Sassify should resolve promise', () => {
	return Sassify( CSSLocation, Settings, Sass ).then( data => {
		expect( data ).toBe( true );
	});
});
