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
import TTY from 'tty';
import Fs from 'fs';
import OS from 'os';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from './logging';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all folders inside a folder
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Get all folders within a given path
 *
 * @param  {string}  thisPath - The path that contains the desired folders
 *
 * @return {array}            - An array of paths to each folder
 */
export const GetFolders = thisPath => {
	Log.verbose(`Looking for folders in ${ Style.yellow( thisPath ) }`);

	try {
		return Fs
			.readdirSync( thisPath )                                               //read the folders content
			.filter(
				thisFile => Fs.statSync(`${ thisPath }/${ thisFile }`).isDirectory() //only return directories
			)
			.map( path => Path.normalize(`${ thisPath }/${ path }`) );             //return with path
	}
	catch( error ) {
		Log.verbose(`${ Style.yellow( thisPath ) } not found`);
		// Log.error( error );

		return [];
	}
};


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

			pkgPath = Spawning.sync( 'npm', ['prefix'], { cwd: rootPath } ); //this will find the nearest package.json

			if( pkgPath.error ) {
				Log.error(`Pancake was unable to find a folder with a package.json file from ${ Style.yellow( rootPath ) }.`);
				Log.space();
				process.exit( 1 );
			}
			else {
				pkgPath = Path.normalize( pkgPath.stdout.toString().replace('\n', '') ); //normalize some oddities npm gives us
			}
		}
		else { //not a valid pancake module
			Log.verbose(`Package.json not a pancake-module in ${ Style.yellow( location ) }`);

			pkgPath = Path.normalize(`${ cwd }/`); //we start looking from here on for the next package.json
		}
	}
	catch( error ) { //no package.json found in this folder
		Log.verbose(`No package.json found in ${ Style.yellow( cwd ) }`);

		rootPath = Path.normalize(`${ cwd }/`); //we start looking from here on for the next package.json

		pkgPath = Spawning.sync( 'npm', ['prefix'], { cwd: rootPath } ); //this will find the nearest package.json

		if( pkgPath.error ) {
			Log.error(`Pancake was unable to find a folder with a package.json file from ${ Style.yellow( rootPath ) }.`);
			Log.space();
			process.exit( 1 );
		}
		else {
			pkgPath = Path.normalize( pkgPath.stdout.toString().replace('\n', '') ); //normalize some oddities npm gives us
		}
	}

	Log.verbose(`Cwd is ${ Style.yellow( pkgPath ) }`);

	return pkgPath;
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get cli window size
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Get the size of the cli window
 * A port from https://github.com/jonschlinkert/window-size
 *
 * @return {object} - An object with width and height
 */
export const Size = () => {
	let width;
	let height;

	if( TTY.isatty( 1 ) ) {
		if( process.stdout.getWindowSize ) {
			width = process.stdout.getWindowSize( 1 )[ 0 ];
			height = process.stdout.getWindowSize( 1 )[ 1 ];
		}
		else if( TTY.getWindowSize ) {
			width = TTY.getWindowSize()[ 1 ];
			height = TTY.getWindowSize()[ 0 ];
		}
		else if( process.stdout.columns && process.stdout.rows ) {
			height = process.stdout.rows;
			width = process.stdout.columns;
		}
	}
	else if( OS.release().startsWith('10') ) {
		const numberPattern = /\d+/g;
		const cmd = 'wmic path Win32_VideoController get CurrentHorizontalResolution,CurrentVerticalResolution';
		const code = Spawn.execSync( cmd ).toString('utf8');
		const res = code.match( numberPattern );

		return {
			height: ~~res[ 1 ],
			width: ~~res[ 0 ],
		};
	}
	else {
		return {
			height: undefined,
			width: undefined,
		};
	}

	return {
		height: height,
		width: width,
	};
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
		catch( error ) { //looks like it’s broken too so let’s just do the old school thing
			console.error( error );
		}
	}

	if( exiting.withoutSpace ) {
		process.exit( 0 ); //exit now
	}

	Log.space();     //adding some space
	process.exit( 0 ); //now exit with a smile :)
};
