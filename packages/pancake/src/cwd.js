/***************************************************************************************************************************************************************
 *
 * Find the current working directory by checking inside the current directory for a package.json and see if it is a pancake module.
 * If it is then we go to the parent folder and run `npm prefix` there. Otherwise run `npm prefix` in the current working directory.
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
import { Spawning } from './helpers';
import { Log, Style } from './logging';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Finding the right folder in which to run npm prefix
 *
 * @return {string} - The absolute path to the folder of your host package.json
 */
export const Cwd = () => {
	Log.verbose(`Looking for cwd`);

	let rootPath;

	//let’s find the package.json and check if it's a valid one
	try {
		const pkgPath = Path.normalize(`${ process.cwd() }/package.json`); //on this level

		const testingPkg = require( pkgPath );

		if( testingPkg.pancake !== undefined ) { //this package.json has an pancake object
			Log.verbose(`Found valid pancake-module packages in ${ Style.yellow( process.cwd() ) }`);

			rootPath = Path.normalize(`${ process.cwd() }/../`); //so let’s go down one level and look for the next package.json file
		}
		else { //not a valid pancake module
			Log.verbose(`Found package.json in ${ Style.yellow( pkgPath ) }`);

			rootPath = Path.normalize(`${ process.cwd() }/`); //we start looking from here on for the next package.json
		}
	}
	catch( error ) { //no package.json found in this folder
		Log.verbose(`No package.json found in ${ Style.yellow( process.cwd() ) }`);

		rootPath = Path.normalize(`${ process.cwd() }/`); //we start looking from here on for the next package.json
	}

	const pkgPath = Spawning.sync( 'npm', ['prefix'], { cwd: rootPath } ).stdout.toString().replace('\n', ''); //this will find the nearest package.json
	Log.verbose(`Found cwd in ${ Style.yellow( pkgPath ) }`);

	return pkgPath;
};
