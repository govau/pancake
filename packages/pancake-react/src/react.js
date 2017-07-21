/***************************************************************************************************************************************************************
 *
 * Generate and compile Sass
 *
 * @repo    - https://github.com/govau/pancake
 * @author  - Dominik Wilkowski and Alex Page
 * @license - https://raw.githubusercontent.com/govau/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style, ReadFile, WriteFile } from '@gov.au/pancake';


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
export const HandleReact = ( from, to, tag ) => {
	console.log('aaaaaaa');
	return new Promise( ( resolve, reject ) => {
		ReadFile( from ) //read the module
			.catch( error => {
				Log.error(`Unable to read file ${ Style.yellow( from ) }`);
				Log.error( error );

				reject( error );
			})
			.then( ( content ) => {


				let code = `\n\n${ content }`;

				code = `/*! ${ tag } */${ code }`;

				WriteFile( to, code ) //write the generated content to file and return its promise
					.catch( error => {
						Log.error( error );

						reject( error );
					})
					.then( () => {
						resolve( code );
				});

		});
	});
};

