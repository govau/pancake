/***************************************************************************************************************************************************************
 *
 * Plug-in for Pancake
 *
 * Move and compile Sass partials.
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
// Plugin export
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
	Log.info(`SASS PLUGIN STARTED`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGS = {
		css: {
			minified: true,
			modules: false,
			browsers: [ 'last 2 versions', 'ie 8', 'ie 9', 'ie 10' ],
			location: 'pancake/css/',
			name: 'pancake.min.css',
		},
		sass: {
			modules: false,
			location: 'pancake/sass/',
			name: 'pancake.scss',
		},
	};

	//merging settings with host settings
	Object.assign( SETTINGS.css, settings.css );
	Object.assign( SETTINGS.sass, settings.sass );


	return new Promise( ( resolve, reject ) => {
		//some housekeeping
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

		//

		Log.ok('SASS PLUGIN FINISHED');
		resolve( SETTINGS );

	});
}
