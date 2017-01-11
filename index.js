#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * Checking peerDependencies, writing compiled files and discovering new modules
 *
 * This tool was built for the Australian DTA UI-Kit. It comes with three cli commands:
 *
 * pancake --batter
 * Checking. It will make sure Sass modules are build correctly and return a descriptive error message when
 * peerDependencies are in conflict with each other. This is invoked via npm postinstall inside each UI-Kit module.
 *
 * pancake --syrup
 * Generate. It will write the appropriate files into a set location for you to digest into your project.
 *
 * pancake --flip
 * Listing. It will list all available modules for you to select and install them for you.
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const WinSize = require('window-size');
const Program = require('commander');
const Semver =  require('semver');
const CFonts = require(`cfonts`);
const Chalk = require('chalk');
const Path = require(`path`);
const Fs = require(`fs`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Package = JSON.parse( Fs.readFileSync( `${ __dirname }/package.json`, `utf8` ) ); //for displaying help and version
const Version = Package.version;


Program
	.description( `This tool let's you flatten your peer dependencies inside the node_module/ folder` )
	.version( `v${ Version }` )
	.usage( `[option1] [option2] <input1>` )
	.option( `-b, --batter [string]`,  `Check dependencies for conflicts.`, Path.normalize(`${ process.cwd() }/../`) )
	.option( `-s, --syrup`,   `Write compiled files into location specified in your package.json` )
	.option( `-f, --flip`,    `Discover gov.au UI-Kit modules and install them` )
	.option( `-v, --verbose`, `Run the program in verbose mode` )
	.parse( process.argv );


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

	return Fs.readdirSync( thisPath ).filter(
		( thisFile ) => Fs.statSync(`${ thisPath }/${ thisFile }`).isDirectory()
	);
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Debugging prettiness
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Logging methods
 *
 * @mixin
 */
const Log = {
	output: false, //have we outputted something yet?

	/**
	 * Log an error
	 *
	 * @param  {string}  text - The text you want to log with the error
	 */
	error: ( text ) => {
		if( !Log.output ) { //if we haven't printed anything yet
			Log.space();      //only then we add an empty line on the top
		}

		CFonts.say(`Error`, { //we need something big to help npms error system
			colors: ['red', 'red'],
		});

		console.error(`🔥  ${ Chalk.red( `ERROR:   ${ text }` ) } `);

		Log.output = true; //now we have written something out
	},

	/**
	 * Log a message
	 *
	 * @param  {string}  text - The text you want to log
	 */
	info: ( text ) => {
		if( !Log.output ) {
			Log.space();
		}

		console.info(`🔔  INFO:    ${ text }`);
		Log.output = true;
	},

	/**
	 * Log success
	 *
	 * @param  {string}  text - The text you want to log
	 */
	ok: ( text ) => {
		if( !Log.output ) {
			Log.space();
		}

		console.info(`👍           ${ Chalk.green( text ) }`);
		Log.output = true;
	},

	/**
	 * Log a verbose message
	 *
	 * @param  {string}  text - The text you want to log
	 */
	verbose: ( text ) => {
		if( Program.verbose ) {
			if( !Log.output ) {
				Log.space();
			}

			console.info(`😬  ${ Chalk.gray( `VERBOSE: ${ text }` ) }`);
			Log.output = true;
		}
	},

	/**
	 * Add some space to the output
	 */
	space: () => {
		console.log(`\n`);
	}
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// PREPARE, Check for dependencies conflicts
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
if( Program.batter ) {
	Log.info(`PANCAKE CHECKING DEPENDENCIES`);

	const dependencies = new Map();                       //a map we populate with the dependencies of our modules we found
	const modules = new Map();                            //a map we for all installed modules and their versions
	let thisPath = Path.normalize(`${ Program.batter }`); //the parent folder which should contain all node modules
	Log.verbose(`Looking for dependency conflicts in: ${ Chalk.yellow( thisPath ) }`);
	let allModules = getFolders( thisPath );              //all folders inside the parent folder
	Log.verbose(`Found the following module folders: ${ Chalk.yellow( allModules ) }`);

	//iterating over all modules inside node_module
	if( allModules !== undefined ) {
		for( let module of allModules ) {
			Log.verbose(`Reading module ${ Chalk.yellow( module ) }`);

			try {
				let modulePackage = JSON.parse( Fs.readFileSync( `${ thisPath }/${ module }/package.json`, `utf8` ) ); //reading the package.json of the current module

				if( modulePackage.description.startsWith(`ui-kit-module: `) ) { //is this a ui-kit module?
					Log.verbose(`Identified ${ Chalk.yellow( module ) } as ui-kit module`);

					modules.set( modulePackage.name, modulePackage.version ); //saving all modules with version for later comparison

					if( modulePackage.peerDependencies !== undefined ) {
						dependencies.set( modulePackage.name, modulePackage.peerDependencies ); //save the dependencies into the map for later comparison
					}
				}
			}
			catch( error ) {
				Log.verbose(`No package.json found in ${ Chalk.yellow( thisPath + module ) }`); //folders like .bin and .staging won't have package.json inside
			}
		}
	}
	else {
		Log.verbose( `No modules found` );
	}

	//iterate over all dependencies
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
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// BAKE, Write files
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
if( Program.syrup ) {
	Log.verbose('bake');
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// DISCOVER, List all available modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
if( !Program.batter && !Program.syrup || Program.flip ) {
	Log.verbose('discover');
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Handle exiting of program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
function ExitHandler( exiting, error ) {
	if( error ) {
		try { //try using our pretty output
			Log.error( error.stack );
		}
		catch( error ) { //looks like it's broken too so let's just do the old school thing
			console.error( error.stack );
		}
	}

	if( exiting.now ) {
		process.exit( 0 ); //exit now
	}

	if( Log.output ) { //if we printed to cli at all
		Log.space();     //adding some space
	}

	process.exit( 0 ); //now exit with a smile :)
}

//adding some event handling to exit signals
process.on( 'exit', ExitHandler.bind( null, { now: false } ) );              //on closing
process.on( 'SIGINT', ExitHandler.bind( null, { now: true } ) );             //on [ctrl] + [c]
process.on( 'uncaughtException', ExitHandler.bind( null, { now: true } ) );  //on uncaught exceptions