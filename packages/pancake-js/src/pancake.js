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
import { Path } from 'path';
import { Fs } from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// import { ExitHandler } from "pancake";
import { Log, Style, Loading } from '@gov.au/pancake';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * The main pancake method for this plugin
 *
 * @param  {array}  modules  - An array of all module objects
 * @param  {object} settings - An object of the host package.json file and it’s path
 * @param  {object} cwd      - The path to the working directory of our host package.json file
 *
 * @return {Promise object}  - Returns an object of the settings we want to save
 */
export const pancake = ( modules, settings, cwd ) => {
	Log.info(`PANCAKE JS PLUGIN`);

	let SETTINGS = {
		js: {
			minified: true,
			modules: false,
			location: 'pancake/js/',
			name: 'pancake.min.js',
		},
	};

	Object.assign( SETTINGS.js, settings.js );

	return new Promise( ( resolve, reject ) => {

		if( typeof modules !== 'object' ) {
			reject(
				`Plugin pancake-js got a missmath for the data that was passed to it! ${ Style.yellow(`modules`) } was ${ Style.yellow( typeof modules ) } ` +
				`but should have been ${ Style.yellow(`array`) }`
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

		setTimeout(() => {
			Log.ok('JS PLUGIN DONE');

			resolve( SETTINGS );
		}, 2000);


		// console.log(modules);
		// console.log('-----');
		// console.log(settings);
		// console.log('-----');
		// console.log(cwd);

		// Log.ok('done');

	});
}
