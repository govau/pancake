/***************************************************************************************************************************************************************
 *
 * Plug-in for Pancake
 *
 * Generate a json file from all pancake modules.
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
import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style, Loading, ReadFile, WriteFile } from '@gov.au/pancake';
// import { HandleJS, MinifyAllJS } from './js';

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
	Loading.start( 'pancake-json', Log.verboseMode );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGS = {
		json: {
			enable: false,
			location: 'pancake/',
			name: 'pancake',
			content: {
				name: true,
				version: true,
				dependencies: true,
				path: true,
				settings: true,
			},
		},
	};

	//merging settings with host settings
	Object.assign( SETTINGS.json, settings.json );

	if( typeof settings.json === 'undefined' ) {
		settings.json = {};
	}

	Object.assign( SETTINGS.json.content, settings.json.content );


	return new Promise( ( resolve, reject ) => {
		//some housekeeping
		if( typeof version !== 'string' ) {
			reject(
				`Plugin pancake-json got a mismatch for the data that was passed to it! ${ Style.yellow(`version`) } was ${ Style.yellow( typeof version ) } ` +
				`but should have been ${ Style.yellow(`string`) }`
			);
		}

		if( typeof modules !== 'object' ) {
			reject(
				`Plugin pancake-json got a mismatch for the data that was passed to it! ${ Style.yellow(`modules`) } was ${ Style.yellow( typeof modules ) } ` +
				`but should have been ${ Style.yellow(`object`) }`
			);
		}

		if( typeof settings !== 'object' ) {
			reject(
				`Plugin pancake-json got a mismatch for the data that was passed to it! ${ Style.yellow(`settings`) } was ${ Style.yellow( typeof settings ) } ` +
				`but should have been ${ Style.yellow(`object`) }`
			);
		}

		if( typeof cwd !== 'string' ) {
			reject(
				`Plugin pancake-json got a mismatch for the data that was passed to it! ${ Style.yellow(`cwd`) } was ${ Style.yellow( typeof cwd ) } ` +
				`but should have been ${ Style.yellow(`string`) }`
			);
		}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Promise loop
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		const JSONOutput = {};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Iterate over each module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		if( SETTINGS.json.enable ) {
			for( const modulePackage of modules ) {
				Log.verbose(`JSON: Building ${ Style.yellow( modulePackage.name ) }`);

				JSONOutput[ modulePackage.name ] = {};

				if( SETTINGS.json.content.name ) {
					JSONOutput[ modulePackage.name ].name = modulePackage.name;
				}

				if( SETTINGS.json.content.version ) {
					JSONOutput[ modulePackage.name ].version = modulePackage.version;
				}

				if( SETTINGS.json.content.dependencies ) {
					JSONOutput[ modulePackage.name ].dependencies = modulePackage.peerDependencies;
				}

				if( SETTINGS.json.content.path ) {
					JSONOutput[ modulePackage.name ].path = modulePackage.path;
				}

				if( SETTINGS.json.content.settings ) {
					JSONOutput[ modulePackage.name ].settings = modulePackage.pancake['pancake-module'];
				}
			}

			if( Object.keys( JSONOutput ).length > 0 ) {
				const jsonPath = Path.normalize(`${ cwd }/${ SETTINGS.json.location }/${ SETTINGS.json.name }.json`);

				WriteFile( jsonPath, JSON.stringify( JSONOutput ) ) //write the generated content to file and return its promise
					.catch( error => {
						Log.error( error );

						reject( error );
					})
					.then( () => {
						Log.ok('JSON PLUGIN FINISHED');
						Loading.stop( 'pancake-json', Log.verboseMode ); //stop loading animation

						resolve( SETTINGS );
				});
			}
			else {
				Loading.stop( 'pancake-json', Log.verboseMode ); //stop loading animation

				Log.info(`No pancake modules found 😬`);
				resolve( SETTINGS );
			}
		}
		else {
			Log.ok('JSON PLUGIN DISABLED');
			Loading.stop( 'pancake-json', Log.verboseMode ); //stop loading animation

			resolve( SETTINGS );
		}
	});
}
