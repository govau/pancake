/***************************************************************************************************************************************************************
 *
 * Check an module object for conflicts
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
// import Path from 'path';
// import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from './logging';
import Semver from './semver-5-3-0';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Check modules for conflicts
 *
 * @param  {object} allModules - An object of all modules
 *
 * @return {object}            - An object that can be used to generate an error message
 */
export const CheckModules = allModules => {
	const dependencies = new Map(); //a map we populate with the dependencies of our modules we found
	const modules = new Map();      //a map for all installed modules and their versions

	let result = {                  //the return object
		conflicts: false,             //we always assume the best
		message: ``,                  //a couple message to help understand the shemozzle
		module: '',                   //the conflict causing module
		dependencies: {},             //other modules that depend on the conflicting module
	};


	//add all packages into our maps
	for( const modulePackage of allModules ) {

		modules.set( modulePackage.name, modulePackage.version ); //saving all modules with version for later comparison

		if( modulePackage.peerDependencies !== undefined ) {
			dependencies.set( modulePackage.name, modulePackage.peerDependencies ); //save the dependencies into the map for later comparison
		}
	}


	//iterate over all dependencies [dependencies] and check against what we have installed [modules]
	for( let [ module, moduleDependencies ] of dependencies ) {
		Log.verbose(`Checking dependencies for ${ Style.yellow( module ) } which are: ${ Style.yellow( JSON.stringify( moduleDependencies ) ) }`);

		for( let dependency of Object.keys( moduleDependencies ) ) {
			let version = moduleDependencies[ dependency ];  //the version we require
			let existing = modules.get( dependency );        //the version we have

			if( !Semver.satisfies( existing, version) || existing === undefined ) { //version conflict or not installed at all?
				result.conflicts = true;    //we found a conflict
				result.module = dependency; //with this module

				let requires = existing === undefined ? //building error message
					`the module ${ Style.bold( dependency ) } but it’s missing.` :
					`${ Style.bold( dependency ) } version ${ Style.bold( version ) }, however version ${ Style.bold( existing ) } was installed.`;

				result.message += `Found conflicting dependenc(ies)\n\n`;
				result.message += `The module ${ Style.bold( module ) } requires ${ requires }\n`;

				//let’s look who else depends on this conflicting module

				const otherModules = {};
				for( let [ subModule, subModuleDependencies ] of dependencies ) {
					if( subModuleDependencies[ dependency ] !== undefined ) {
						if( otherModules[ subModuleDependencies[ dependency ] ] === undefined ) {
							otherModules[ subModuleDependencies[ dependency ] ] = [];
						}

						otherModules[ subModuleDependencies[ dependency ] ].push( subModule ); //sort by version
					}
				}

				//sort versions
				const otherModulesOrdered = {};
				Object
					.keys( otherModules )
					.sort()
					.forEach( ( key ) => {
						otherModulesOrdered[ key ] = otherModules[ key ];
				});

				result.dependencies = otherModulesOrdered;

				//generate tree
				result.message += `\n\n${ Style.bold( dependency ) } is required by the following modules:`;

				for( const key of Object.keys( otherModulesOrdered ) ) {
					result.message += Style.bold(`\n\n. ${ key }`);

					for( let i = 0; i < otherModulesOrdered[ key ].length; i++ ) {
						result.message += `\n${ ( i + 1 ) == otherModulesOrdered[ key ].length ? '└' : '├' }── ${ otherModulesOrdered[ key ][ i ] }`;
					};

				}

				result.message += `\n\nTo fix this issue make sure all your modules require the same version.`;

				//suggestion...
				if( Object.keys( otherModules ).length == 1 ) {
					result.message += `/nMaybe upgrade the ${ Style.bold( dependency ) } module.`;
				}
			}
		}
	}

	Log.verbose(`Result of checking:\n${ Style.yellow( JSON.stringify( result ) ) }`);

	return result;
};
