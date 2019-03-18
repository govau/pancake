/***************************************************************************************************************************************************************
 *
 * Check dependencies and handle conflicts
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
const StripAnsi = require( 'strip-ansi' );
const Inquirer = require( 'inquirer' );
const Request = require( 'request' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const { Log, Style, Semver } = require( '@gov.au/pancake' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Exports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Check all dependencies against installed modules and return what breakage might occur and an array of all dependencies
 *
 * @param  {object}  dependencies - All dependencies this module has
 * @param  {map}     installed    - All installed modules to check against
 * @param  {integer} longestName  - The longest name in our output so we can calculate spaces
 *
 * @return {object}               - { breakage: [boolean], lines: [array], breaking: [array] }
 */
module.exports.AddDeps = ( dependencies, installed, longestName ) => {
	Log.verbose(
		`Checking dependencies: ${ Style.yellow( JSON.stringify( dependencies ) ) } against installed: ${ Style.yellow( JSON.stringify( [ ...installed ] ) ) }`
	);

	let breakage = false; //we always assume the best
	let breaking = [];    //in here we collect all modules that will break to display at the end
	let lines = [];       //one line per dependency
	let i = 0;            //need to see what the last dependency is

	for( const module of Object.keys( dependencies ) ) {
		i ++; //count iterations
		let name = module.split('/')[ 1 ]; //removing npm scoping string
		let version = dependencies[ module ];
		const installedModule = installed.get( module ); //looking up if this version exists in our installed modules

		if( installedModule !== undefined && !Semver.satisfies( installedModule, version ) ) { //there is some breakage happening here
			breaking.push(`${ module }@${ version }`); //we need this for when we display what we’ve installed later

			//make it easy to read
			name = Style.magenta( name );
			version = Style.magenta( `${ version }   !   ${ installedModule }` );

			breakage = true; //totally borked
		}
		else {
			version += `            `; //alignment is everything for readability
		}

		//new lines have to be inside a Separator. Bug launched here: https://github.com/SBoudrias/Inquirer.js/issues/494
		lines.push(
			new Inquirer.Separator(
				`${ i >= Object.keys( dependencies ).length ? '└──' : '├──' } ` +
				`${ name } ` +
				`${ ' '.repeat( longestName - StripAnsi( name ).length ) }` +
				`${ version }` +
				`${ installedModule !== undefined ? '   installed' : '' }`
			)
		);
	}

	return {
		breakage: breakage,
		lines: lines,
		breaking: breaking,
	};

};
