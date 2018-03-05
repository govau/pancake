/***************************************************************************************************************************************************************
 *
 * Plug-in for Pancake
 *
 * Move react files from pancake modules into your pancake folder
 *
 * @repo    - https://github.com/govau/pancake
 * @author  - Alex Page (and Dominik Wilkowski)
 * @license - https://raw.githubusercontent.com/govau/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import Path from 'path';
import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style, Loading, ReadFile, WriteFile } from '@gov.au/pancake';
import { HandleReact } from './react';

Log.output = true; //this plugin assumes you run it through pancake


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Plugin export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * The main pancake method for this plugin
 *
 * @param  {array}  version        - The version of mother pancake
 * @param  {array}  modules        - An array of all module objects
 * @param  {object} settings       - An object of the host package.json file and it’s path
 * @param  {object} GlobalSettings - An object of the global settings
 * @param  {object} cwd            - The path to the working directory of our host package.json file
 *
 * @return {Promise object}  - Returns an object of the settings we want to save
 */
export const pancake = ( version, modules, settings, GlobalSettings, cwd ) => {
	Loading.start( 'pancake-react', Log.verboseMode );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGS = {
		react: {
			location: 'pancake/react/',
		},
	};

	//merging settings with host settings
	Object.assign( SETTINGS.react, settings.react );


	return new Promise( ( resolve, reject ) => {
		//some housekeeping
		if( typeof version !== 'string' ) {
			reject(
				`Plugin pancake-react got a mismatch for the data that was passed to it! ${ Style.yellow(`version`) } was ${ Style.yellow( typeof version ) } ` +
				`but should have been ${ Style.yellow(`string`) }`
			);
		}

		if( typeof modules !== 'object' ) {
			reject(
				`Plugin pancake-react got a mismatch for the data that was passed to it! ${ Style.yellow(`modules`) } was ${ Style.yellow( typeof modules ) } ` +
				`but should have been ${ Style.yellow(`object`) }`
			);
		}

		if( typeof settings !== 'object' ) {
			reject(
				`Plugin pancake-react got a mismatch for the data that was passed to it! ${ Style.yellow(`settings`) } was ${ Style.yellow( typeof settings ) } ` +
				`but should have been ${ Style.yellow(`object`) }`
			);
		}

		if( typeof cwd !== 'string' ) {
			reject(
				`Plugin pancake-react got a mismatch for the data that was passed to it! ${ Style.yellow(`cwd`) } was ${ Style.yellow( typeof cwd ) } ` +
				`but should have been ${ Style.yellow(`string`) }`
			);
		}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Iterate over each module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		let reactModules = []; // for collect all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Iterate over each module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		if( SETTINGS.react.location !== false ) {
			for( const modulePackage of modules ) {
				Log.verbose(`React: Building ${ Style.yellow( modulePackage.name ) }`);

				//check if there are react files
				let reactModulePath;
				if( modulePackage.pancake['pancake-module'].react !== undefined ) {
					reactModulePath = Path.normalize(`${ modulePackage.path }/${ modulePackage.pancake['pancake-module'].react.path }`);
				}

				if( !Fs.existsSync( reactModulePath ) ) {
					Log.verbose(`React: No React found in ${ Style.yellow( reactModulePath ) }`)
				}
				else {
					Log.verbose(`React: ${ Style.green('⌘') } Found React files in ${ Style.yellow( reactModulePath ) }`);

					const reactModuleToPath = Path.normalize(`${ cwd }/${ SETTINGS.react.location }/${ modulePackage.name.split('/')[ 1 ] }.js`);

					//move react file depending on settings
					const reactPromise = HandleReact( reactModulePath, reactModuleToPath, `${ modulePackage.name } v${ modulePackage.version }` )
						.catch( error => {
							Log.error( error );
					});

					reactModules.push( reactPromise );
				}
			}

			if( modules.length < 1 ) {
				Loading.stop( 'pancake-react', Log.verboseMode ); //stop loading animation

				Log.info(`No pancake modules found 😬`);
				resolve( SETTINGS );
			}
			else {

				//after all files have been compiled and written
				Promise.all( reactModules )
					.catch( error => {
						Loading.stop( 'pancake-react', Log.verboseMode ); //stop loading animation

						Log.error(`React plugin ran into an error: ${ error }`);
					})
					.then( () => {
						Log.ok('REACT PLUGIN FINISHED');

						Loading.stop( 'pancake-react', Log.verboseMode ); //stop loading animation
						resolve( SETTINGS );
				});

			}
		}
		else {
			Log.ok('REACT PLUGIN DISABLED');
			Loading.stop( 'pancake-react', Log.verboseMode ); //stop loading animation

			resolve({});
		}

	});
}
