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
import Autoprefixer from 'autoprefixer';
import Postcss from 'postcss';
import Sass from 'node-sass';
import Path from 'path';

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style, WriteFile } from '@gov.au/pancake';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**/
const GetDependencies = ( module, modules, parent = module, iteration = 1 ) => {
	Log.verbose(`Sass: Looking up dependencies at level ${ Style.yellow( iteration ) }`);

	let allDependencies = {};

	if( iteration > 50 ) {
		Log.error(`Sass: Looks like we found a circular dependency that seems to go no-where from ${ Style.yellow( parent ) }.`);
	}
	else {

		for( const item of modules ) {
			if( item.name === module ) {
				if( item.peerDependencies ) {
					for( const subDependency of Object.keys( item.peerDependencies ) ) {
						const subDependencies = GetDependencies( subDependency, modules, parent, ( iteration + 1 ) );

						allDependencies = Object.assign( allDependencies, subDependencies );
					}
				}

				allDependencies = Object.assign( allDependencies, item.peerDependencies );

				break;
			}
		}

	}

	return allDependencies;
};


/**
 * Generate Sass code for a module and it’s dependencies
 *
 * @param  {string} location - The location of the module to be compiled
 * @param  {object} name     - The name of the module
 * @param  {object} modules  - All modules and their dependencies
 *
 * @return {string}          - Sass code to tie dependencies and module together
 */
export const GenerateSass = ( location, name, modules ) => {
	let sass = ``; //the code goes here

	const baseLocation = Path.normalize(`${ location }/../`);
	const dependencies = GetDependencies( name, modules );

	Log.verbose(`Sass: For ${ Style.yellow( name ) } we found the following dependencies ${ Style.yellow( JSON.stringify( dependencies ) ) }`);

	if( dependencies ) {
		for( const dependency of Object.keys( dependencies ) ) {
			const modulePath = dependency.split('/')[ 1 ];

			sass += `@import "${ Path.normalize(`${ baseLocation }/${ modulePath }/lib/sass/_module.scss`) }";\n`;
			//TODO: change this to use the modulePackage.pancake['pancake-module'].sass.path value
		}
	}

	sass += `@import "${ Path.normalize(`${ location }/lib/sass/_module.scss`) }";\n`;
	//TODO: change this to use the modulePackage.pancake['pancake-module'].sass.path value

	return sass;
};


/**
 * Compile Sass, autoprefix it and save it to disk
 *
 * @param  {string} location - The path we want to save the compiled css to
 * @param  {object} settings - The SettingsCSS object
 * @param  {string} sass     - The Sass to be compiled
 *
 * @return {promise object}  - Boolean true for 👍 || string error for 👎
 */
export const Sassify = ( location, settings, sass ) => {
	return new Promise( ( resolve, reject ) => {
		const compiled = Sass.render({
			data: sass,
			indentType: 'tab', //this is how real developers indent!
			outputStyle: settings.minified ? 'compressed' : 'expanded',
		}, ( error, renered ) => {
			if( error ) {
				Log.error(`Sass compile failed for ${ Style.yellow( location ) }`);

				reject( error.message );
			}
			else {
				Log.verbose(`Sass: Successfully compiled Sass for ${ Style.yellow( location ) }`);

				Postcss([ Autoprefixer({ browsers: settings.browsers }) ])
					.process( renered.css )
					.catch( error => reject( error ) )
					.then( ( prefixed ) => {
						if( prefixed ) {
							prefixed
								.warnings()
								.forEach( warn => Log.error( warn.toString() ) );

							Log.verbose(`Sass: Successfully autoprefixed CSS for ${ Style.yellow( location ) }`);

							WriteFile( location, prefixed.css ) //write the generated content to file and return its promise
								.catch( error => {
									Log.error( error );

									reject( error );
								})
								.then( () => {
									resolve( true );
							});
						}
				});
			}
		});
	});
};
