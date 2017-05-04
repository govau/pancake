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
/**
 * Get the include path for a sass partial
 *
 * @param  {string} module       - The module name
 * @param  {object} modules      - An object of all modules and their settings
 * @param  {string} baseLocation - The current base path
 * @param  {string} npmOrg       - The npm org scope
 *
 * @return {string}              - The path to the sass partial
 */
export const GetPath = ( module, modules, baseLocation, npmOrg ) => {
	let modulePath = '';

	for( const item of modules ) {
		if( item.name === module ) {
			const moduleName = module.replace(`${ npmOrg }/`, '');

			modulePath = Path.normalize(`${ baseLocation }/${ moduleName }/${ item.pancake['pancake-module'].sass.path }`);

			break;
		}
	}

	return modulePath;
}


/**
 * Look up all dependencies of a module by calling yourself
 *
 * @param  {string}  module    - The name of the module
 * @param  {object}  modules   - All modules in an object array
 * @param  {string}  parent    - The name of the parent module, Defaults to the module argument
 * @param  {integer} iteration - The depth of the iteration, defaults to 1
 *
 * @return {object}            - An object array of the dependencies that are needed for the module
 */
export const GetDependencies = ( module, modules, parent = module, iteration = 1 ) => {
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
 * @param  {object} npmOrg   - The name of the npm org scope
 *
 * @return {string}          - Sass code to tie dependencies and module together
 */
export const GenerateSass = ( location, name, modules, npmOrg ) => {
	let sass = ``; //the code goes here

	const baseLocation = Path.normalize(`${ location }/../`);
	const dependencies = GetDependencies( name, modules );

	Log.verbose(`Sass: For ${ Style.yellow( name ) } we found the following dependencies ${ Style.yellow( JSON.stringify( dependencies ) ) }`);

	if( dependencies ) {
		for( const dependency of Object.keys( dependencies ) ) {
			const modulePath = GetPath( dependency, modules, baseLocation, npmOrg )

			sass += `@import "${ modulePath }";\n`;
		}
	}

	const modulePath = GetPath( name, modules, baseLocation, npmOrg )
	sass += `@import "${ modulePath }";\n`;

	return sass.replace(/\\/g, "\\\\"); // escape path for silly windows
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
		}, ( error, generated ) => {
			if( error ) {
				Log.error(`Sass compile failed for ${ Style.yellow( location ) }`);

				reject( error.message );
			}
			else {
				Log.verbose(`Sass: Successfully compiled Sass for ${ Style.yellow( location ) }`);

				Postcss([ Autoprefixer({ browsers: settings.browsers }) ])
					.process( generated.css )
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
