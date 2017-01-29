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
let pkgPath = Path.normalize(`${ process.cwd() }/`); //default value of the pkgPath path

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


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// PREPARE, Check for dependencies conflicts
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info(`PANCAKE CHECKING DEPENDENCIES`);

const dependencies = new Map();                             //a map we populate with the dependencies of our modules we found
const modules = new Map();                                  //a map for all installed modules and their versions

const npmVersion = parseInt( Spawn('npm', ['-v']).stdout ); //check the npm version
Log.verbose(`NPM version ${ Chalk.yellow( npmVersion ) } detected`);

//npm 3 and higher is required as below will install dependencies inside each module folder
if( npmVersion < 3 ) {
	Log.error(`The UI-Kit can only be installed via npm 3 and higher.`);
	Log.space();
	process.exit( 1 );
}

//now we go through all modules and make sure all peerDependencies are satisfied
const allPackages = pancakes.GetPackages( pkgPath ); //read all packages and return an object per module

allPackages
	.catch( error => {
		Log.error(`Reading all package.json files bumped into an error: ${ error }`, verbose);
	})
	.then( allModules => { //once we got all the content from all package.json files

		//add all packages into our maps
		for( const modulePackage of allModules ) {

			modules.set( modulePackage.name, modulePackage.version ); //saving all modules with version for later comparison

			if( modulePackage.peerDependencies !== undefined ) {
				dependencies.set( modulePackage.name, modulePackage.peerDependencies ); //save the dependencies into the map for later comparison
			}
		}

		//iterate over all dependencies [dependencies] and check against what we have installed [modules]
		for( let [ module, moduleDependencies ] of dependencies ) {
			Log.verbose(`Checking dependencies for ${ Chalk.yellow( module ) }  which are: ${ Chalk.yellow( JSON.stringify( moduleDependencies ) ) }`);

			for( let dependency of Object.keys( moduleDependencies ) ) {
				let version = moduleDependencies[ dependency ];  //the version we require
				let existing = modules.get( dependency );        //the version we have

				if( !Semver.satisfies( existing, version) || existing === undefined ) { //version conflict or not installed at all?
					let message = existing === undefined ? //building error message
						`the module ${ Chalk.bold( dependency ) } but it's missing.` :
						`${ Chalk.bold( dependency ) } version ${ Chalk.bold( version ) }, however version ${ Chalk.bold( existing ) } was installed.`;

					Log.error( `Found conflicting dependenc(ies)` );
					Log.error( `The module ${ Chalk.bold( module ) } requires ${ message }` );

					//let's look who else depends on this conflicting module
					const otherModules = {};
					for( let [ subModule, subModuleDependencies ] of dependencies ) {
						if( subModuleDependencies[ dependency ] !== undefined ) {
							if( otherModules[ subModuleDependencies[ dependency ] ] === undefined ) {
								otherModules[ subModuleDependencies[ dependency ] ] = [];
							}

							otherModules[ subModuleDependencies[ dependency ] ].push( subModule ); //sort by version
						}
					}

					//sort versions
					const otherModulesOrdered = {};
					Object
						.keys( otherModules )
						.sort()
						.forEach( ( key ) => {
							otherModulesOrdered[ key ] = otherModules[ key ];
					});

					//generate tree
					message = `\n\n${ Chalk.bold( dependency ) } is required by the following modules:`;

					for( const key of Object.keys( otherModulesOrdered ) ) {
						message += Chalk.bold(`\n\n. ${ key }`);

						for( let i = 0; i < otherModulesOrdered[ key ].length; i++ ) {
							message += `\n${ ( i + 1 ) == otherModulesOrdered[ key ].length ? '└' : '├' }── ${ otherModulesOrdered[ key ][ i ] }`;
						};

					}

					console.log( Chalk.red( `${ message }\n` ) ); //print tree

					Log.error( `To fix this issue make sure all your modules require the same version.` );

					//suggestion...
					if( Object.keys( otherModules ).length == 1 ) {
						Log.error( `Maybe upgrade the ${ Chalk.bold( dependency ) } module.` );
					}

					process.exit( 1 ); //error out so npm knows things went wrong
				}
			}
		}

		if( allModules.length > 0 ) {
			Log.ok( `All modules(${ allModules.length }) without conflict 💥` );
		}
		else {
			Log.info( `No modules found 😬` );
		}

		//checking settings
		const PackagePath = Path.normalize(`${ pkgPath }/package.json`);
		let PKG = {
			uikit: {},
		};

		try {
			PKG = JSON.parse( Fs.readFileSync( PackagePath, `utf8` ) );

			Log.verbose(`Read settings at ${ Chalk.yellow( PackagePath ) }`);
		}
		catch( error ) {
			Log.verbose(`No package.json found at ${ Chalk.yellow( PackagePath ) }`);
		}

		//we only fire up syrup if the settings allow
		if( PKG.uikit['auto-syrup'] !== false ) {
			Log.verbose(`Running syrup with: ${ Chalk.yellow( `pancake syrup ${ pkgPath } ${ Program.verbose ? '-v' : '' }` ) }`);

			Spawn('pancake', ['syrup', pkgPath, Program.verbose ? '-v' : ''], { shell: true, stdio: 'inherit' });
		}
	}
);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on( 'exit', pancakes.ExitHandler.bind( null, { now: false } ) );              //on closing
process.on( 'SIGINT', pancakes.ExitHandler.bind( null, { now: true } ) );             //on [ctrl] + [c]
process.on( 'uncaughtException', pancakes.ExitHandler.bind( null, { now: true } ) );  //on uncaught exceptions