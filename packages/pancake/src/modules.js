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
import { GetFolders } from './helpers';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Reading and parsing a package.json file of a module
 *
 * @param  {string}  pkgPath - The path to the folder the package.json is in (omitting package.json)
 *
 * @return {promise object}  - Returns a promise and some of the data of the package.json
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
 * @return {promise object}  - A promise.all that resolves when all package.jsons have been read
 */
export const GetModules = ( pkgPath, npmOrg = '' ) => {
	if( typeof pkgPath !== 'string' || pkgPath.length <= 0 ) {
		Log.error(`GetPackages only takes a valid path. You passed [type: ${ Style.yellow( typeof pkgPath ) }] "${ Style.yellow( pkgPath ) }"`);
	}

	pkgPath = Path.normalize(`${ pkgPath }/node_modules/${ npmOrg }/`); //we add our npm org scope to the path to make this more effective

	Log.verbose(`Looking for pancake modules in: ${ Style.yellow( pkgPath ) }`);

	const allModules = GetFolders( pkgPath ); //all folders inside the selected path

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
