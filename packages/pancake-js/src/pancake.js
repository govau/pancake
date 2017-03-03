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
import { Log, Style } from '@gov.au/pancake';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * The main pancake method for this plugin
 *
 * @param  {array}  modules - An array of all module objects
 * @param  {object} host    - An object of the host package.json file and it’s path
 *
 * @return {Promise object} - Returns a string with either error in rejection or string with ok message
 */
export const pancake = ( modules, host ) => {
	if( typeof modules !== 'array' ) {
		Log.error(
			`Plugin pancake-js got a missmath for the data that was passed to it! ${ Style.yellow(`modules`) } was ${ Style.yellow( typeof modules ) } ` +
			`but should have been ${ Style.yellow(`array`) }`
		);

		Log.space();
		process.exit( 1 );
	}

	if( typeof host !== 'object' ) {
		Log.error(
			`Plugin pancake-js got a missmath for the data that was passed to it! ${ Style.yellow(`host`) } was ${ Style.yellow( typeof host ) } ` +
			`but should have been ${ Style.yellow(`object`) }`
		);

		Log.space();
		process.exit( 1 );
	}

	Log.info('yayayaya!!!');
}
