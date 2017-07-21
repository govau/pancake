/***************************************************************************************************************************************************************
 *
 * Generate and compile Sass
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
import UglifyJS from 'uglify-js';
import Path from 'path';

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style, ReadFile, WriteFile } from '@gov.au/pancake';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Minify JS so we have one function not several
 *
 * @param  {string} js   - The JS code to be minified
 * @param  {string} file - The file name for error reporting
 *
 * @return {string}      - The minified js code
 */
export const MinifyJS = ( js, file ) => {

	try {
		const jsCode = UglifyJS.minify( js, {
			fromString: true,
			comments: /^\/*!/,
		});

		return jsCode.code;
	}
	catch( error ) {
		Log.error(`Unable to uglify js code for ${ Style.yellow( file ) }`);
		Log.error( error.message );

		return js;
	}

};


/**
 * Get js from module, minify depending on settings and write to disk
 *
 * @param  {string} from     - Where is the module so we can read from there
 * @param  {object} settings - The SettingsJS object
 * @param  {string} to       - Where shall we write the module to if settings allow?
 * @param  {string} tag      - The tag to be added to the top of the file
 *
 * @return {promise object}  - The js code either minified or bare bone
 */
export const HandleJS = ( from, settings, to, tag ) => {
	return new Promise( ( resolve, reject ) => {
		ReadFile( from ) //read the module
			.catch( error => {
				Log.error(`Unable to read file ${ Style.yellow( from ) }`);
				Log.error( error );

				reject( error );
			})
			.then( ( content ) => {

				let code = '';

				if( settings.minified ) { //minification = uglify code
					code = MinifyJS( content, from );

					Log.verbose(`JS: Successfully uglified JS for ${ Style.yellow( from ) }`);
				}
				else { //no minification = just copy and rename
					code = `\n\n${ content }`;
				}

				code = `/*! ${ tag } */${ code }`;

				if( settings.modules ) { //are we saving modules?
					WriteFile( to, code ) //write the generated content to file and return its promise
						.catch( error => {
							Log.error( error );

							reject( error );
						})
						.then( () => {
							resolve( code );
					});
				}
				else {
					resolve( code ); //just return the promise
				}
		});
	});
};


/**
 * Minify all js modules together once their promises have resolved
 *
 * @param  {array}  version  - The version of mother pancake
 * @param  {array}  allJS    - An array of promise object for all js modules which will return their code
 * @param  {object} settings - The SettingsJS object
 * @param  {string} pkgPath  - The path to the current working directory
 *
 * @return {promise object}  - Returns true once the promise is resolved
 */
export const MinifyAllJS = ( version, allJS, settings, pkgPath ) => {
	return new Promise( ( resolve, reject ) => {
		Promise.all( allJS )
			.catch( error => {
				Log.error(`JS: Compiling JS ran into an error: ${ error }`);
			})
			.then( ( js ) => {
				const Package = require( Path.normalize(`${ __dirname }/../package.json`) );

				const locationJS = Path.normalize(`${ pkgPath }/${ settings.location }/${ settings.name }`);
				let code = '';

				if( settings.minified ) {
					code = MinifyJS( js.join(`\n\n`), locationJS );

					Log.verbose(`JS: Successfully uglified JS for ${ Style.yellow( locationJS ) }`);
				}
				else {
					code = '\n\n' + js.join(`\n\n`);
				}

				code = `/* PANCAKE v${ version } PANCAKE-JS v${ Package.version } */${ code }\n`;

				WriteFile( locationJS, code ) //write file
					.catch( error => {
						Log.error( error );

						reject( error );
					})
					.then( () => {
						resolve( true );
				});
		});
	});
};
