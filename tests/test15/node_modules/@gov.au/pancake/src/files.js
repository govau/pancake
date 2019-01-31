/***************************************************************************************************************************************************************
 *
 * Handle files, read, write, check
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


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all folders inside a folder
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Get all folders within a given path
 *
 * @param  {string}  thisPath - The path that contains the desired folders
 *
 * @return {array}            - An array of paths to each folder
 */
export const GetFolders = thisPath => {
	Log.verbose(`Looking for folders in ${ Style.yellow( thisPath ) }`);

	try {
		return Fs
			.readdirSync( Path.normalize( thisPath ) )                                               //read the folders content
			.filter(
				thisFile => Fs.statSync( Path.normalize(`${ thisPath }/${ thisFile }`) ).isDirectory() //only return directories
			)
			.map( path => Path.normalize(`${ thisPath }/${ path }`) );                               //return with path
	}
	catch( error ) {
		Log.verbose(`${ Style.yellow( thisPath ) } not found`);
		// Log.error( error );

		return [];
	}
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Create all folders in a path
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Create a path if it doesn’t exist
 *
 * @param  {string}  dir      - The path to be checked and created if not found
 *
 * @return {string}           - The path that was just worked at
 */
export const CreateDir = ( dir ) => {
	Log.verbose(`Creating path ${ Style.yellow( dir ) }`);

	const splitPath = dir.split( Path.sep );

	splitPath.reduce( ( path, subPath ) => {
		let currentPath;

		if( /^win/.test( process.platform ) && path === '' ) { // when using windows (post truth) at beginning of the path
			path = './';                                         // we add the prefix to make sure it works on windows (yuck)
		}

		if( subPath != '.' ) {
			currentPath = Path.normalize(`${ path }/${ subPath }`);

			Log.verbose(`Checking if ${ Style.yellow( currentPath ) } exists`)

			if( !Fs.existsSync( currentPath ) ) {
				try {
					Fs.mkdirSync( currentPath );

					Log.verbose(`Successfully ${ Style.yellow( currentPath ) } created`)
				}
				catch( error ) {
					Log.error(`Pancake was unable to create the folder ${ Style.yellow( currentPath ) } for path ${ Style.yellow( dir ) }`);
					Log.error( error );

					process.exit( 1 );
				}
			}
		}
		else {
			currentPath = subPath;
		}

		return currentPath;
	}, '');

	return splitPath.join( Path.sep );
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Write file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Promisified writing a file
 *
 * @param  {string} location - The location the file should be written to
 * @param  {string} content  - The content of the file
 *
 * @return {promise object}  - Boolean true for 👍 || string error for 👎
 */
export const WriteFile = ( location, content ) => {
	CreateDir( Path.dirname( location ) );

	return new Promise( ( resolve, reject ) => {
		Fs.writeFile( location, content, `utf8`, ( error ) => {
			if( error ) {
				Log.error(`Writing file failed for ${ Style.yellow( location ) }`);
				Log.error( JSON.stringify( error ) );

				reject( error );
			}
			else {
				Log.verbose(`Successfully written ${ Style.yellow( location ) }`);

				resolve( true );
			}
		});
	});
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Read file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Promisified reading a file
 *
 * @param  {string} location - The location of the file to be read
 *
 * @return {promise object}  - The content of the file
 */
export const ReadFile = location => {
	return new Promise( ( resolve, reject ) => {
		Fs.readFile( location, `utf8`, ( error, content ) => {
			if( error ) {
				Log.error(`Reading file failed for ${ Style.yellow( location ) }`);
				Log.error( JSON.stringify( error ) );

				reject( error );
			}
			else {
				Log.verbose(`Successfully read ${ Style.yellow( location ) }`);

				resolve( content );
			}
		});
	});
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Copy file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Copy a file to another location
 *
 * @param  {string} fromFile - The path to the source file
 * @param  {string} toFile   - The path to the destination
 *
 * @return {promise object}  - The content of the file
 */
export const CopyFile = ( fromFile, toFile ) => {
	CreateDir( Path.dirname( location ) );

	return new Promise( ( resolve, reject ) => {
		let writeStream = Fs.createWriteStream( toFile )
			.on( 'error', handleError )
			.on( 'finish', () => {
				Log.verbose(`Successfully copied ${ Style.yellow( toFile ) }`);

				resolve();
		});

		let readStream = Fs.createReadStream( fromFile )
			.on( 'error', handleError )
			.pipe( writeStream );

		function handleError( error ) {
			Log.error(`Copying file failed for ${ Style.yellow( location ) }`);
			Log.error( JSON.stringify( error ) );

			readStream.destroy();
			writeStream.end();
			reject( error );
		}
	});
};
