#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * SYRUP 🍯
 *
 * @repo    - https://github.com/AusDTO/uikit-pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/AusDTO/uikit-pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Autoprefixer = require('autoprefixer');
const Program = require('commander');
const Postcss = require('postcss');
const Sass = require('node-sass');
const Chalk = require('chalk');
const Path = require(`path`);
const Fs = require(`fs`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
let pkgPath = Path.normalize(`${ process.cwd() }/`); //default value of the pkgPath path

Program
	.description('syrup')
	.usage( `[command] <input> <option>` )
	.action( pkgPathArgument => {
		pkgPath = pkgPathArgument; //overwriting default value with user input
	})
	.option( `-n, --no-save`, `Don't save my compile ettings into my package.json` )
	.option( `-v, --verbose`, `Run the program in verbose mode` )
	.parse( process.argv );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const pancakes = require(`./pancake-utilities.js`)( Program.verbose );
const Log = pancakes.Log;


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reusable functions
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Generate Sass code for a module and it's dependencies
 *
 * @param  {string} location     - The location of the module to be compiled
 * @param  {object} dependencies - The dependencies of this module
 *
 * @return {string}              - Sass code to tie dependencies and module together
 */
const GenerateSass = ( location, dependencies ) => {
	let sass = ``; //the code goes here

	if( Object.keys( dependencies ).length ) {
		const baseLocation = Path.normalize(`${ location }/../`);

		for( const dependency of Object.keys( dependencies ) ) {
			const modulePath = dependency.substring( pancakes.npmOrg.length, dependency.length );

			sass += `@import "${ Path.normalize(`${ baseLocation }/${ modulePath }/dist/sass/module.scss`) }";\n`;
		}
	}

	sass += `@import "${ Path.normalize(`${ location }/dist/sass/module.scss`) }";\n`;

	return sass;
};


/**
 * Compile Sass, autoprefix it and save it to disk (depending on [ SettingsCSS.modules ]) and return it
 *
 * @param  {string} location - The path we want to save the compiled css to
 * @param  {string} sass     - The Sass to be compiled
 *
 * @return {string}          - The compiled css
 */
const Sassify = ( location, sass ) => {
	pancakes.CreateDir( Path.dirname( location ) );

	return new Promise( ( resolve, reject ) => {
		const compiled = Sass.render({
			data: sass,
			outputStyle: 'compressed',
		}, ( error, renered ) => {
			if( error ) {
				Log.error(`:( Sass compile failed for ${ Chalk.yellow( location ) }`);
				Log.error( error.message );

				reject( error );
			}
			Log.verbose(`Successfully compiled Sass for ${ Chalk.yellow( location ) }`);

			Postcss([ Autoprefixer({ browsers: ['last 2 versions', 'ie 8', 'ie 9', 'ie 10'] }) ])
				.process( renered.css )
				.then( ( prefixed ) => {
					prefixed
						.warnings()
						.forEach( ( warn ) => {
							Log.error( warn.toString() );

							reject( error );
					});
					Log.verbose(`Successfully autoprefixed CSS for ${ Chalk.yellow( location ) }`);

					if( SettingsCSS.modules ) {
						Fs.writeFile( location, prefixed.css, `utf8`, ( error ) => {
							if( error ) {
								Log.error(`Writing file failed for ${ Chalk.yellow( location ) }`);
								Log.error( JSON.stringify( error ) );

								reject( error );
							}
							else {
								Log.verbose(`Successfully written ${ Chalk.yellow( location ) }`);

								resolve( prefixed.css );
							}
						});
					}
					else {
						resolve( prefixed.css );
					}
			});
		});
	});
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reading settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info(`PANCAKE COMPILING MODULES`);

//reading local settings
const PackagePath = Path.normalize(`${ pkgPath }/package.json`);
let PKG = JSON.parse( Fs.readFileSync( PackagePath, `utf8` ) );

if( PKG.uikit === undefined ) { //let's make merging easy
	PKG.uikit = {};
}

//default settings
let SettingsCSS = {
	'minified': true,
	'sass': true,
	'modules': false,
	'location': 'uikit/css/',
};

let SettingsJS = {
	'minified': true,
	'modules': false,
	'location': 'uikit/js/',
}

//merging default settings with local package.json
Object.assign( SettingsCSS, PKG.uikit.css );
Object.assign( SettingsJS, PKG.uikit.js );

Log.verbose(`Merged local settings with defaults: ${
	Chalk.yellow(`\nSettingsCSS: ${ JSON.stringify( SettingsCSS ) }\nSettingsJS:  ${ JSON.stringify( SettingsJS ) }`)
}`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Going through all modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const allPackages = pancakes.GetPackages( pkgPath ); //read all packages and return an object per module

allPackages
	.catch( error => {
		Log.error(`Reading all package.json files bumped into an error: ${ error }`);
	})
	.then( allModules => { //once we got all the content from all package.json files
		let compiledSass = []; //for collect all promises

		//iterate over each module
		for( const modulePackage of allModules ) {
			Log.verbose(`Bulding ${ Chalk.yellow( modulePackage.name ) }`);

			const location = Path.normalize(`${ pkgPath }/${ SettingsCSS.location }/${ modulePackage.name.substring( pancakes.npmOrg.length + 1 ) }.css`);
			const sass = GenerateSass( modulePackage.path, modulePackage.peerDependencies ); //generate the import statements depending on dependencies

			compiledSass.push( Sassify( location, sass ) ); //generate file or sass
		}

		Promise.all( compiledSass ) //after all Sass files have been compiled
			.catch( error => {
				Log.error(`Compiling Sass ran into an error: ${ error }`);
			})
			.then( ( css ) => {

				const location = Path.normalize(`${ pkgPath }/${ SettingsCSS.location }/uikit.min.css`);

				Fs.writeFile( location, css, `utf8`, ( error ) => {
					if( error ) {
						Log.error(`Writing file failed for ${ Chalk.yellow( location ) }`);
						Log.error( JSON.stringify( error ) );
					}
					else {
						Log.verbose(`Successfully written ${ Chalk.yellow( location ) }`);

						console.log('all done');
					}
				});
		});
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on( 'exit', pancakes.ExitHandler.bind( null, { now: false } ) );              //on closing
process.on( 'SIGINT', pancakes.ExitHandler.bind( null, { now: true } ) );             //on [ctrl] + [c]
process.on( 'uncaughtException', pancakes.ExitHandler.bind( null, { now: true } ) );  //on uncaught exceptions