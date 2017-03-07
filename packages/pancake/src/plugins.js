/***************************************************************************************************************************************************************
 *
 * Install and run plugins
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
import Path from 'path';
// import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from './logging';
import { Spawning } from './helpers';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Check if plugins exist and install if not
 *
 * @param  {array}  plugins  - An array of plugin names
 * @param  {string} cwd      - The path to our working directory
 *
 * @return {object}          - Return an object listing plugins installed and plugins found
 */
export const InstallPlugins = ( plugins, cwd ) => {
	const result = {
		found: [],
		installing: [],
	};

	//go through all plugins
	plugins.map( plugin => {

		try {
			require( Path.normalize(`${ cwd }/node_modules/${ plugin }`) );

			result.found.push( plugin );
		}
		catch( error ) {
			result.installing.push( plugin );
		}

	});


	if( result.installing.length > 0 ) {
		Log.verbose(`Trying to install: ${ Style.yellow( JSON.stringify( result.installing ) ) }`);

		//checking if we got yarn installed
		const command = Spawning.sync( 'yarn', [ '--version' ] );
		const hasYarn = command.stdout && command.stdout.toString().trim() ? true : false;

		Log.verbose(`Yarn ${ Style.yellow( hasYarn ? 'was' : 'was not' ) } detected`);

		let installing; //for spawning our install process

		//installing modules
		if( hasYarn ) {
			installing = Spawning.sync( 'yarn', [ 'add', ...result.installing ], { cwd: cwd } );
		}
		else {
			installing = Spawning.sync( 'npm', [ 'install', ...result.installing ], { cwd: cwd } );
		}

		//install has failed :(
		if( installing.status !== 0 ) {
			Log.error(`Installing plugins failed`);
			Log.error( installing.stderr.toString() );

			process.exit( 1 );
		}
	}

	return result;
};


/**
 * Run a bunch of plugins
 *
 * @param  {string} version       - The version of mother pancake
 * @param  {array}  plugins       - An array of plugin names
 * @param  {string} cwd           - The path to our working directory
 * @param  {array}  allModules    - An array of all modules to be passed to plugin
 * @param  {object} SETTINGSlocal - The object of our local settings
 *
 * @return {promise object}       - Pass on what the plugins returned
 */
export const RunPlugins = ( version, plugins, cwd, allModules, SETTINGSlocal ) => {

	let plugin;
	let running = [];

	return new Promise( ( resolve, reject ) => {

		//go through all plugins
		const allPlugins = plugins.map( plugin => {
			Log.verbose(`Shooting off ${ Style.yellow( plugin ) }`);

			plugin = require( Path.normalize(`${ cwd }/node_modules/${ plugin }`) );

			return plugin.pancake( version, allModules, SETTINGSlocal, cwd ) //run ’em
				.catch( error => {
					reject( error );

					process.exit( 1 );
			});
		});

		Promise.all( allPlugins )
			.then( data => {
				return resolve( data ); //resolve only after all plugins have run
		});
	});


};
