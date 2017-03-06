#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * Checking peerDependencies for conflicts
 * This tool was built to make working with npm and the front end easy and seamless.
 *
 * @repo    - https://github.com/govau/pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/govau/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Using this file to export the reusable items
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { ExitHandler, CheckNPM, Cwd, Size, Spawning } from './helpers';
import { Log, Style, Loading } from './logging';
import { ParseArgs } from './parse-arguments';
import { CheckModules } from './conflicts';
import { GetModules } from './modules';
import { Settings } from './settings';


export { ExitHandler, CheckNPM, Cwd, Size, Spawning, Log, Style, Loading, ParseArgs, CheckModules, GetModules, Settings };


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get batter object
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Running all the important bits to get us the data we need to run Pancake programmatically
 *
 * @param  {array} argv     - The arguments passed to node
 *
 * @return {Promise object} - The data object of the pancake modules
 */
export const batter = ( argv = process.argv ) => {

	// Check npm version
	const npmVersion = CheckNPM();

	//npm 3 and higher is required as below will install dependencies inside each module folder
	if( !npmVersion ) {
		Log.error(`Pancake only works with npm 3 and later.`);
		Log.space();
		process.exit( 1 );
	}

	// Get global settings
	let SETTINGS = Settings.getGlobal();

	// Parsing cli arguments
	const ARGS = ParseArgs( SETTINGS, argv );

	// Finding the current working directory
	const pkgPath = Cwd( ARGS.cwd );

	// Get local settings
	let SETTINGSlocal = Settings.getLocal( pkgPath );

	// Get all modules data
	return new Promise( ( resolve, reject ) => {

		GetModules( pkgPath, SETTINGS.npmOrg )
			.catch( error => {
				reject(`Reading all package.json files bumped into an error: ${ error }`);
				reject( error );
			})
			.then( allModules => { //once we got all the content from all package.json files
				Log.verbose(`Gathered all modules:\n${ Style.yellow( JSON.stringify( allModules ) ) }`);

				if( allModules.length > 0 ) {
					const conflicts = CheckModules( allModules ); //check for conflicts

					if( conflicts.conflicts ) {
						reject( conflicts );
					}
					else {
						resolve( AllModules );
					}
				}
				else {
					resolve( AllModules );
				}
		});

	});
}
