/***************************************************************************************************************************************************************
 *
 * Read all pancake packages
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
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from './logging';
import { GetFolders } from './files';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Reading and parsing a package.json file of a module
 *
 * @param  {string}  pkgPath - The path to the folder the package.json is in
 *     (omitting package.json)
 *
 * @return {promise object}  - Returns a promise and some of the data of the
 *     package.json
 */
export const ReadModule = pkgPath => {
	const thisPath = Path.normalize(`${ pkgPath }/package.json`);

	Log.verbose(`Reading ${ Style.yellow( thisPath ) }`);

	return new Promise( ( resolve, reject ) => {
		Fs.readFile( thisPath, `utf8`, ( error, data ) => {
			if( error ) {
				Log.verbose(`No package.json found in ${ Style.yellow( thisPath ) }`); //folders like .bin and .staging won’t have package.json inside

				resolve( null );
			}
			else {

				const packageJson = JSON.parse( data ); //parse the package.json

				if( typeof packageJson.pancake === 'object' ) { //is this a pancake module?
					Log.verbose(`${ Style.green('✔') } Identified ${ Style.yellow( packageJson.name ) } as pancake module`);

					//we only want a subset
					const miniPackage = {
						name: packageJson.name,
						version: packageJson.version,
						peerDependencies: packageJson.peerDependencies,
						pancake: packageJson.pancake,
						path: pkgPath,
					}

					resolve( miniPackage );
				}
				else {
					resolve( null ); //non-pancake packages get null so we can identify them later and filter them out
				}
			}
		});
	});
};


/**
 * Get an object of all pancake modules inside a specified folder
 *
 * @param  {string}  pkgPath - The path that includes your node_module folder
 * @param  {string}  npmOrg  - The npmOrg scope
 *
 * @return {promise object}  - A promise.all that resolves when all
 *     package.jsons have been read
 */
export const GetModules = ( pkgPath, npmOrg = '' ) => {
	if( typeof pkgPath !== 'string' || pkgPath.length <= 0 ) {
		Log.error(`GetPackages only takes a valid path. You passed [type: ${ Style.yellow( typeof pkgPath ) }] "${ Style.yellow( pkgPath ) }"`);
	}

	const modulesPath = Path.normalize(`${ pkgPath }/node_modules/${ npmOrg }/`); //we add our npm org scope to the path to make this more effective

	Log.verbose(`Looking for pancake modules in: ${ Style.yellow( pkgPath ) }`);

	var allModules = GetFolders(modulesPath); //all folders inside the selected path

	const altModulesPath = Path.normalize(`${ pkgPath }/../node_modules/${ npmOrg }/`);
	if (Fs.existsSync(altModulesPath)) {
		Log.verbose(`Also looking for pancake modules in: ${ Style.yellow(altModulesPath) }`);
		allModules = allModules.concat(GetFolders(altModulesPath)); //all folders inside the selected path
	}

	if( allModules !== undefined && allModules.length > 0 ) {
		Log.verbose(`Found the following module folders:\n${ Style.yellow( allModules.join('\n') ) }`);

		const allPackages = allModules.map( pkg => {
			return ReadModule(pkg)
				.catch( error => {
					Log.error( error );

					process.exit( 1 );
			});
		}); //read all packages and save the promise return

		return Promise.all( allPackages ).then( ( packages ) => { //chaining the promise
			return packages.filter( p => p !== null );              //making sure packages not identified as a pancake module don’t leave a trace in the returned array
		});
	}
	else {
		return Promise.resolve([]); //no pancake modules found at all
	}
};


/**
 * Generate an object from the allModules object to filter out all plugins
 * requested by all modules
 *
 * @param  {object} allModules - The object off all modules from GetModules()
 *
 * @return {array}             - An array of all plugins
 */
export const GetPlugins = allModules => {
	let plugins = {};

	allModules.map( module => {
		if( module.pancake === undefined ) { //so we can pass the error message on to next block
			module.pancake = {};
		}

		if( module.pancake['pancake-module'] === undefined ) {
			Log.error(`The data passed to GetPlugins is missing the "${ Style.yellow(`pancake-module`) }" object.`);

			return false;
		}

		module.pancake['pancake-module'].plugins.map( plugin => {
			plugins[ plugin ] = 'yay!'; //we make them objects to filter out duplicates :)
		});
	});

	Log.verbose(`Found the following plugins ${ Style.yellow( JSON.stringify( Object.keys( plugins ) ) ) }`);

	return Object.keys( plugins );
}
