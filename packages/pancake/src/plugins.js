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
import { Log, Style, Loading } from './logging';
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
 * @return {promise object}  - Return an object listing plugins installed and plugins found
 */
export const InstallPlugins = ( plugins, cwd ) => {
	const result = {
		found: [],
		installing: [],
	};

	const output = false; //switch output of child process to stdout

	return new Promise( ( resolve, reject ) => {

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
			Log.info(`INSTALLING ${ result.installing.join(', ') }`);

			//get the config so we can return them to what they were
			const cacheLockStale = Spawning.sync( 'npm', [ 'config', 'get', 'cache-lock-stale' ] ).stdout.toString().trim();
			const cacheLockWait = Spawning.sync( 'npm', [ 'config', 'get', 'cache-lock-wait' ] ).stdout.toString().trim();

			Log.verbose(`Npm config was cache-lock-stale: ${ Style.yellow( cacheLockStale ) } cache-lock-wait: ${ Style.yellow( cacheLockWait ) }`);

			//setting new config for just this install to not wait too long for the lockfiles
			Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-stale', '10' ] );
			Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-wait', '10' ] );

			//checking if we got yarn installed
			// const command = Spawning.sync( 'yarn', [ '--version' ] );
			// const hasYarn = command.stdout && command.stdout.toString().trim() ? true : false;
			const hasYarn = false; //disabled yarn as it has some issues

			if( !output ) {
				Loading.start(); //waiting with loading to after the blocking child processes
			}

			Log.verbose(`Yarn ${ Style.yellow( hasYarn ? 'was' : 'was not' ) } detected`);

			let installing; //for spawning our install process

			if( output ) {
				Loading.stop();
				Log.space();
			}

			//options for our child process
			let spawnOpt = { cwd: cwd };
			if( output ) {
				spawnOpt = { cwd: cwd, stdio: 'inherit' };
			}

			//installing modules
			if( hasYarn ) {
				Spawning.async( 'yarn', [ 'add', ...result.installing ], spawnOpt )
					.catch( error => {
						Loading.stop();

						//return npm config to what it was before
						Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-stale', cacheLockStale ] );
						Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-wait', cacheLockWait ] );

						Log.error(`Installing plugins failed`);
						reject( error );
					})
					.then( data => {
						//return npm config to what it was before
						Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-stale', cacheLockStale ] );
						Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-wait', cacheLockWait ] );

						resolve( result );
				});
			}
			else {
				Spawning.async( 'npm', [ 'install', '--no-progress', '--save', ...result.installing ], spawnOpt )
					.catch( error => {
						Loading.stop();

						//return npm config to what it was before
						Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-stale', cacheLockStale ] );
						Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-wait', cacheLockWait ] );

						Log.error(`Installing plugins failed`);
						reject( error );
					})
					.then( data => {
						if( output ) {
							Log.space();
						}

						//return npm config to what it was before
						Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-stale', cacheLockStale ] );
						Spawning.sync( 'npm', [ 'config', 'set', 'cache-lock-wait', cacheLockWait ] );

						resolve( result );
				});
			}
		}
		else {
			resolve( result );
		}
	});
};


/**
 * Run a bunch of plugins
 *
 * @param  {string} version       - The version of mother pancake
 * @param  {array}  plugins       - An array of plugin names
 * @param  {string} cwd           - The path to our working directory
 * @param  {array}  allModules    - An array of all modules to be passed to plugin
 * @param  {object} SETTINGSlocal - The object of our local settings
 * @param  {object} SETTINGS      - The global settings object
 *
 * @return {promise object}       - Pass on what the plugins returned
 */
export const RunPlugins = ( version, plugins, cwd, allModules, SETTINGSlocal, SETTINGS ) => {

	Loading.stop();

	let plugin;
	let running = [];

	return new Promise( ( resolve, reject ) => {

		//go through all plugins
		const allPlugins = plugins.map( plugin => {
			Log.info(`ADDING TOPPINGS TO YOUR PANCAKE VIA ${ plugin }`);

			plugin = require( Path.normalize(`${ cwd }/node_modules/${ plugin }`) );

			return plugin.pancake( version, allModules, SETTINGSlocal, SETTINGS, cwd ) //run ’em
				.catch( error => {
					Log.error( error );

					process.exit( 1 );
			});
		});

		Promise.all( allPlugins )
			.catch( error => {
				Log.error( error );

				process.exit( 1 );
			})
			.then( data => {
				Loading.start();

				return resolve( data ); //resolve only after all plugins have run
		});
	});


};
