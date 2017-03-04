/***************************************************************************************************************************************************************
 *
 * Returning ansi escape color codes
 *
 * @repo    - https://github.com/govau/pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/govau/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import Spawn from 'child_process';
import Path from 'path';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from './logging';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Finding CWD
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Find the current working directory by checking inside the current directory for a package.json and see if it is a pancake module.
 * If it is then we go to the parent folder and run `npm prefix` there. Otherwise run `npm prefix` in the current working directory.
 *
 * @param  {string} cwd - Path to current working directory
 *
 * @return {string} - The absolute path to the folder of your host package.json
 */
export const Cwd = ( cwd = process.cwd() ) => {
	Log.verbose(`Looking for cwd in ${ Style.yellow( cwd ) }`);

	let rootPath;
	let pkgPath;

	//let’s find the package.json and check if it's a valid one
	try {
		const location = Path.normalize(`${ cwd }/package.json`); //on this level

		const testingPkg = require( location );

		if( testingPkg.pancake['pancake-module'] !== undefined ) { //this package.json has an pancake-module object
			Log.verbose(`Found valid pancake-module packages in ${ Style.yellow( cwd ) }`);

			rootPath = Path.normalize(`${ cwd }/../`); //so let’s go down one level and look for the next package.json file

			pkgPath = Spawning.sync( 'npm', ['prefix'], { cwd: rootPath } ).stdout.toString().replace('\n', ''); //this will find the nearest package.json
		}
		else { //not a valid pancake module
			Log.verbose(`Package.json not a pancake-module in ${ Style.yellow( location ) }`);

			pkgPath = Path.normalize(`${ cwd }/`); //we start looking from here on for the next package.json
		}
	}
	catch( error ) { //no package.json found in this folder
		Log.verbose(`No package.json found in ${ Style.yellow( cwd ) }`);

		rootPath = Path.normalize(`${ cwd }/`); //we start looking from here on for the next package.json

		pkgPath = Spawning.sync( 'npm', ['prefix'], { cwd: rootPath } ).stdout.toString().replace('\n', ''); //this will find the nearest package.json
	}

	Log.verbose(`Cwd is ${ Style.yellow( pkgPath ) }`);

	return pkgPath;
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Spawning new processes cross os
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Spawning child processes in an abstraction so we can handle different OS
 *
 * @type {Object}
 */
export const Spawning = {
	isWin: /^win/.test( process.platform ), //sniffing the os, Can’t use os.platform() as we want to support node 5

	/**
	 * Spawning async
	 *
	 * @param  {string}  command - The program we run
	 * @param  {array}   options - the flags and options we pass to it
	 * @param  {object}  param   - Parameters we pass to child_process
	 *
	 * @return {Promise object}  - The object returned from child_process.spawn
	 */
	async: ( command, options, param = {} ) => {
		Log.verbose(`Spawning async ${ Style.yellow(`${ command } ${ [ ...options ].join(' ') } `) } with ${ Style.yellow( JSON.stringify( param ) ) }` );

		if( Spawning.isWin ) {
			return Spawn.spawn( 'cmd.exe', [ '/s', '/c', command, ...options ], param );
		}
		else {
			return Spawn.spawn( command, [ ...options ], param );
		}
	},

	/**
	 * Spawning sync
	 *
	 * @param  {string}  command - The program we run
	 * @param  {array}   options - the flags and options we pass to it
	 * @param  {object}  param   - Parameters we pass to child_process
	 *
	 * @return {Promise object}  - The object returned from child_process.spawnSync
	 */
	sync: ( command, options, param = {} ) => {

		Log.verbose(
			`Spawning sync ${ Style.yellow(`${ command } ${ [ ...options ].join(' ') }`) } with ${ Style.yellow( JSON.stringify( param ) ) }`
		);

		if( Spawning.isWin ) {
			return Spawn.spawnSync( 'cmd.exe', [ '/s', '/c', command, ...options ], param );
		}
		else {
			return Spawn.spawnSync( command, [ ...options ], param );
		}
	},
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Exit handler
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Handle exiting of program
 *
 * @param {null}   exiting - null for bind
 * @param {object} error   - Object to distinguish between closing events
 */
export const ExitHandler = ( exiting, error ) => {
	if( error && error !== 1 ) {
		try { //try using our pretty output
			Log.error( error );
		}
		catch( error ) { //looks like it's broken too so let's just do the old school thing
			console.error( error );
		}
	}

	if( exiting.withoutSpace ) {
		process.exit( 0 ); //exit now
	}

	if( Log.output ) { //if we printed to cli at all
		Log.space();     //adding some space
	}

	process.exit( 0 ); //now exit with a smile :)
};
