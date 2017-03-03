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
// import Path from 'path';
// import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from './logging';


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

		Log.verbose(`Spawning sync ${ Style.yellow(`${ command } ${ [ ...options ].join(' ') }`) } with ${ Style.yellow( JSON.stringify( param ) ) }` );

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

	if( exiting.now ) {
		process.exit( 0 ); //exit now
	}

	if( Log.output ) { //if we printed to cli at all
		Log.space();     //adding some space
	}

	process.exit( 0 ); //now exit with a smile :)
};
