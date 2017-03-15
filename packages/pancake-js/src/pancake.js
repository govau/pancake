/***************************************************************************************************************************************************************
 *
 * Plug-in for Pancake
 *
 * Move and uglify js files from pancake modules into your pancake folder
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
import { HandelJS, MinifyAllJS } from './js';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Plugin export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * The main pancake method for this plugin
 *
 * @param  {array}  version  - The version of mother pancake
 * @param  {array}  modules  - An array of all module objects
 * @param  {object} settings - An object of the host package.json file and it’s path
 * @param  {object} cwd      - The path to the working directory of our host package.json file
 *
 * @return {Promise object}  - Returns an object of the settings we want to save
 */
export const pancake = ( version, modules, settings, cwd ) => {
	Log.info(`ADDING SYRUP/JS TO YOUR PANCAKE`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGS = {
		js: {
			minified: true,
			modules: false,
			location: 'pancake/js/',
			name: 'pancake.min.js',
		},
	};

	//merging settings with host settings
	Object.assign( SETTINGS.js, settings.js );


	return new Promise( ( resolve, reject ) => {
		//some housekeeping
		if( typeof version !== 'string' ) {
			reject(
				`Plugin pancake-js got a missmath for the data that was passed to it! ${ Style.yellow(`version`) } was ${ Style.yellow( typeof version ) } ` +
				`but should have been ${ Style.yellow(`string`) }`
			);
		}

		if( typeof modules !== 'object' ) {
			reject(
				`Plugin pancake-js got a missmath for the data that was passed to it! ${ Style.yellow(`modules`) } was ${ Style.yellow( typeof modules ) } ` +
				`but should have been ${ Style.yellow(`object`) }`
			);
		}

		if( typeof settings !== 'object' ) {
			reject(
				`Plugin pancake-js got a missmath for the data that was passed to it! ${ Style.yellow(`settings`) } was ${ Style.yellow( typeof settings ) } ` +
				`but should have been ${ Style.yellow(`object`) }`
			);
		}

		if( typeof cwd !== 'string' ) {
			reject(
				`Plugin pancake-js got a missmath for the data that was passed to it! ${ Style.yellow(`cwd`) } was ${ Style.yellow( typeof cwd ) } ` +
				`but should have been ${ Style.yellow(`string`) }`
			);
		}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		let compiledAll = [];      //for collect all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Iterate over each module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		for( const modulePackage of modules ) {
			Log.verbose(`JS: Bulding ${ Style.yellow( modulePackage.name ) }`);

			//check if there are js files
			const jsModulePath = Path.normalize(`${ modulePackage.path }/${ modulePackage.pancake['pancake-module'].js.path }`);

			if( !Fs.existsSync( jsModulePath ) ) {
				Log.verbose(`JS: No js found in ${ Style.yellow( jsModulePath ) }`)
			}
			else {
				Log.verbose(`JS: ${ Style.green('⌘') } Found Javascript files in ${ Style.yellow( jsModulePath ) }`);

				const jsModuleToPath = Path.normalize(`${ cwd }/${ SETTINGS.js.location }/${ modulePackage.name.split('/')[ 1 ] }.js`);

				const jsPromise = HandelJS( jsModulePath, SETTINGS.js, jsModuleToPath ) //compile js and write to file depending on settings
					.catch( error => {
						Log.error( error );
				});

				compiledAll.push( jsPromise ); //collect all js promises so we can save the SETTINGS.js.name file later
			}
		}


		if( modules.length < 1 ) {
			Loading.stop(); //stop loading animation

			Log.info(`No pancake modules found 😬`);
			resolve( SETTINGS );
		}
		else {

			//write SETTINGS.js.name file
			if( SETTINGS.js.name !== false ) {
				compiledAll.push(
					MinifyAllJS( version, compiledAll, SETTINGS.js, cwd )
						.catch( error => {
							Log.error( error );
					})
				);
			}

			//after all files have been compiled and written
			Promise.all( compiledAll )
				.catch( error => {
					Loading.stop(); //stop loading animation

					Log.error(`Js plugin ran into an error: ${ error }`);
				})
				.then( () => {
					Loading.stop(); //stop loading animation

					Log.ok('JS PLUGIN FINISHED');
					resolve( SETTINGS );
			});

		}

	});
}
