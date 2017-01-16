#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * BATTER ✅
 *
 * This script will check all modules installed inside the ${ npmOrg } folder and check each peer dependency. Descriptive errors are written out when
 * dependency conflicts are detected.
 *
 * @repo    - https://github.com/AusDTO/uikit-pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/AusDTO/uikit-pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Spawn = require( 'child_process' ).spawnSync;
const Program = require('commander');
const Semver =  require('semver');
const Chalk = require('chalk');
const Path = require(`path`);
const Fs = require(`fs`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
let pkgPath = Path.normalize(`${ process.cwd() }/../../`); //default value of the pkgPath path

Program
	.arguments('<pkgPath>')
	.usage( `[command] <input> <option>` )
	.action( pkgPathArgument => {
		pkgPath = pkgPathArgument; //overwriting default value with user input
	})
	.option( `-v, --verbose`, `Run the program in verbose mode` )
	.parse( process.argv );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const pancakes = require(`./pancake-utilities.js`)( Program.verbose );
const Log = pancakes.Log;

const npmOrg = '@gov.au';
const controlKeyword = 'uikit-module';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GLOBALS
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Get all folders within a given path
 *
 * @param  {string}  thisPath - The path that contains the desired folders
 *
 * @return {array}            - An array of names of each folder
 */
const getFolders = ( thisPath ) => {
	Log.verbose(`Running getFolders on ${ Chalk.yellow( thisPath ) }`);

	try {
		return Fs.readdirSync( thisPath ).filter(
			( thisFile ) => Fs.statSync(`${ thisPath }/${ thisFile }`).isDirectory()
		);
	}
	catch( error ) {
		Log.verbose(`${ Chalk.yellow( thisPath ) } not found`);
		return [];
	}
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// PREPARE, Check for dependencies conflicts
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info(`PANCAKE CHECKING DEPENDENCIES`);

const dependencies = new Map();                             //a map we populate with the dependencies of our modules we found
const modules = new Map();                                  //a map for all installed modules and their versions

const npmVersion = parseInt( Spawn('npm', ['-v']).stdout ); //check the npm version
Log.verbose(`NPM version ${ Chalk.yellow( npmVersion ) } detected`);

if( npmVersion < 3 ) { //npm 3 and higher is required as below will install dependencies inside each module folder
	Log.error(`The UI-Kit can only be installed via npm 3 and higher.`);
	Log.space();
	process.exit( 1 );
}

pkgPath = Path.normalize(`${ pkgPath }/node_modules/${ npmOrg }/`); //we add our npm org to the path

Log.verbose(`Looking for dependency conflicts in: ${ Chalk.yellow( pkgPath ) }`);
let allModules = getFolders( pkgPath ); //all folders inside the selected path

//iterating over all modules inside node_module
if( allModules !== undefined && allModules.length > 0 ) {
	Log.verbose(`Found the following module folders: ${ Chalk.yellow( allModules ) }`);

	for( let module of allModules ) {
		Log.verbose(`Reading module ${ Chalk.yellow( module ) }`);

		try {
			let modulePackage = JSON.parse( Fs.readFileSync( `${ pkgPath }/${ module }/package.json`, `utf8` ) ); //reading the package.json of the current module

			if( modulePackage.keywords.indexOf( controlKeyword ) ) { //is this a uikit module?
				Log.verbose(`${ Chalk.green('✔') } Identified ${ Chalk.yellow( module ) } as ui-kit module`);

				modules.set( modulePackage.name, modulePackage.version ); //saving all modules with version for later comparison

				if( modulePackage.peerDependencies !== undefined ) {
					dependencies.set( modulePackage.name, modulePackage.peerDependencies ); //save the dependencies into the map for later comparison
				}
			}
		}
		catch( error ) {
			Log.verbose(`No package.json found in ${ Chalk.yellow( pkgPath + module ) }`); //folders like .bin and .staging won't have package.json inside
		}
	}
}
else {
	Log.verbose( `No modules found` );
}

//iterate over all dependencies [dependencies] and check against what we have installed [dependencies]
for( let [ module, moduleDependencies ] of dependencies ) {
	Log.verbose(`Checking dependencies for ${ Chalk.yellow( module ) }  which are: ${ Chalk.yellow( JSON.stringify( moduleDependencies ) ) }`);

	for( let dependency of Object.keys( moduleDependencies ) ) {
		let version = moduleDependencies[ dependency ];  //the version we require
		let existing = modules.get( dependency );        //the version we have

		if( !Semver.satisfies( existing, version) || existing === undefined ) { //version conflict or not installed at all?
			let message = existing === undefined ? //building error message
				`the module ${ Chalk.bold( dependency ) } but it's missing.` :
				`${ Chalk.bold( dependency ) } version ${ Chalk.bold( version ) }, however version ${ Chalk.bold( existing ) } was installed.`;

			Log.error( `The module ${ Chalk.bold( module ) } requires ${ message }` );
			Log.space(); //adding some space to the bottom

			process.exit( 1 ); //error out so npm knows things went wrong
		}
	}
}

Log.ok( `All modules are ok!` );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on( 'exit', pancakes.ExitHandler.bind( null, { now: false } ) );              //on closing
process.on( 'SIGINT', pancakes.ExitHandler.bind( null, { now: true } ) );             //on [ctrl] + [c]
process.on( 'uncaughtException', pancakes.ExitHandler.bind( null, { now: true } ) );  //on uncaught exceptions