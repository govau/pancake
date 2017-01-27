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
const UglifyJS = require("uglify-js");
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
 * Promisified writing a file
 *
 * @param  {string} location - The location the file should be written to
 * @param  {string} content  - The content of the file
 *
 * @return {promise object}  - Boolean true for 👍 || string error for 👎
 */
const WriteFile = ( location, content ) => {
	pancakes.CreateDir( Path.dirname( location ) );

	return new Promise( ( resolve, reject ) => {
		Fs.writeFile( location, content, `utf8`, ( error ) => {
			if( error ) {
				Log.error(`Writing file failed for ${ Chalk.yellow( location ) }`);
				Log.error( JSON.stringify( error ) );

				reject( error );
			}
			else {
				Log.verbose(`Successfully written ${ Chalk.yellow( location ) }`);

				resolve( true );
			}
		});
	});
};


/**
 * Compile Sass, autoprefix it and save it to disk
 *
 * @param  {string} location - The path we want to save the compiled css to
 * @param  {string} sass     - The Sass to be compiled
 *
 * @return {promise object}  - Boolean true for 👍 || string error for 👎
 */
const Sassify = ( location, sass ) => {
	return new Promise( ( resolve, reject ) => {
		const compiled = Sass.render({
			data: sass,
			indentType: 'tab', //this is how real developers indent!
			outputStyle: SettingsCSS.minified ? 'compressed' : 'expanded',
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

					WriteFile( location, prefixed.css ) //write the generated content to file and return its promise
						.catch( error => {
							Log.error( error );

							reject( error );
						})
						.then( () => {
							resolve( true );
					});
			});
		});
	});
};


/**
 * Remove duplicated lines
 *
 * @param  {string} content - A bunch of lines that COULD have duplicates
 *
 * @return {string}         - Removed duplicate lines
 */
const StripDuplicateLines = content => {
	let lines = content.split(`\n`); //split into each line

	if( lines[ lines.length - 1 ] === '' ) { //remove empty line at the end
		lines.pop();
	}

	let sortedLines = [ ...new Set( lines ) ]; //make each line unique

	return sortedLines.join(`\n`);
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
	'modules': false,
	'location': 'uikit/css/',
	'name': 'uikit.min.css',
};

let SettingsSASS = {
	'generate': true,
	'modules': false,
	'location': 'uikit/sass/',
	'name': 'uikit.scss',
};

let SettingsJS = {
	'minified': true,
	'modules': false,
	'location': 'uikit/js/',
	'name': 'uikit.min.js',
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
	.then( allModules => {  //once we got all the content from all package.json files
		let compiledAll = []; //for collect all promises
		let allSass = '';     //all modules to be collected for SettingsCSS.name file
		let allJS = [];       //all js files from all uikit modules

		//iterate over each module
		for( const modulePackage of allModules ) {
			Log.verbose(`Bulding ${ Chalk.yellow( modulePackage.name ) }`);

			//generate the import statements depending on dependencies
			let sass = GenerateSass( modulePackage.path, modulePackage.peerDependencies );
			allSass += sass; //for SettingsCSS.name file

			//write css file
			if( SettingsCSS.modules ) {
				const location = Path.normalize(`${ pkgPath }/${ SettingsCSS.location }/${ modulePackage.name.substring( pancakes.npmOrg.length + 1 ) }.css`);

				compiledAll.push( Sassify( location, sass ) ); //generate css and write file
			}

			//write scss file
			if( SettingsSASS.generate ) {
				const location = Path.normalize(`${ pkgPath }/${ SettingsSASS.location }/${ modulePackage.name.substring( pancakes.npmOrg.length + 1 ) }.scss`);

				sass = `/* ${ modulePackage.name } v${ modulePackage.version } */\n\n${ sass }`;

				compiledAll.push( WriteFile( location, sass ) ); //generate css and write file
			}

			//check if there is js
			const jsPath = Path.normalize(`${ modulePackage.path }/dist/js/module.js`);

			if( Fs.existsSync( jsPath ) ) {
				console.log('compile js!');
			}
		}

		//write the SettingsCSS.name file
		const location = Path.normalize(`${ pkgPath }/${ SettingsCSS.location }/${ SettingsCSS.name }`);
		allSass = `/*! UI-Kit 2.0 */\n\n` + StripDuplicateLines( allSass ); //remove duplicate import lines

		compiledAll.push( Sassify( location, allSass ) ); //generate SettingsCSS.name file

		//write SettingsSASS.name file
		if( SettingsSASS.generate ) {
			const location = Path.normalize(`${ pkgPath }/${ SettingsSASS.location }/${ SettingsSASS.name }`);

			compiledAll.push( WriteFile( location, allSass ) ); //generate file or sass
		}


		//js
		//js modules?


		//after all Sass files have been compiled
		Promise.all( compiledAll )
			.catch( error => {
				Log.error(`Compiling Sass ran into an error: ${ error }`);
			})
			.then( ( css ) => {
				Log.ok( `The Sass has been compiled 💥` );
		});
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on( 'exit', pancakes.ExitHandler.bind( null, { now: false } ) );              //on closing
process.on( 'SIGINT', pancakes.ExitHandler.bind( null, { now: true } ) );             //on [ctrl] + [c]
process.on( 'uncaughtException', pancakes.ExitHandler.bind( null, { now: true } ) );  //on uncaught exceptions