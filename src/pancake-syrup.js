#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * SYRUP 🍯
 *
 * This script will compile your assets and save them in a folder outside node_modules/. This behavior can be changed in your own package.json.
 *
 * @repo    - https://github.com/AusDTO/pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/AusDTO/pancake/master/LICENSE (MIT)
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
//possible settings to overwrite
let pkgPath = ''; //the working path as global

Program
	.usage( `[command] <input> <option>` )
	.arguments('<pkgPath>')
	.option( `-n, --nosave`,       `Don't save my compile settings into my package.json` )
	.option( `-b, --batter`,       `Running syrup directly from batter` )
	.option( `-v, --verbose`,      `Run the program in verbose mode` )
	.option( `-o, --org [npmOrg]`, `Overwrite the default json URL` )
	.action( ( pkgPathArgument, options ) => {
		pkgPath = pkgPathArgument;

		if( !Path.isAbsolute( pkgPath ) ) { //converting to absolute path
			pkgPath = Path.resolve( pkgPath );
		}
	})
	.parse( process.argv );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const pancakes = require(`./pancake-utilities.js`)( Program.verbose, Program.org ? Program.org : undefined );
const Log = pancakes.Log;


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Banner and loading
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info(`PANCAKE ADDING SYRUP`);

pancakes.Loading.start(); //start loading animation


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Working folder
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
if( pkgPath.length > 0 ) { //the path has been set by user
	pkgPath = pancakes.SpawningSync( 'npm', ['prefix'], { cwd: pkgPath } ).stdout.toString().replace('\n', '');
}
else { //we go with default
	pkgPath = pancakes.SpawningSync( 'npm', ['prefix'], { cwd: process.cwd() } ).stdout.toString().replace('\n', '');
}

pkgPath = Path.normalize( pkgPath ); //normalize some oddities npm gives us

Log.verbose(`The woring directory is ${ Chalk.yellow( pkgPath ) }`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// npm scope setting
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
let npmOrg = Program.org ? Program.org : pancakes.SETTINGS.npmOrg;

Log.verbose(`The npm scope is ${ Chalk.yellow( npmOrg ) }`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reusable functions
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
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
 * Promisified reading a file
 *
 * @param  {string} location - The location of the file to be read
 *
 * @return {promise object}  - The content of the file
 */
const ReadFile = location => {
	return new Promise( ( resolve, reject ) => {
		Fs.readFile( location, `utf8`, ( error, content ) => {
			if( error ) {
				Log.error(`Reading file failed for ${ Chalk.yellow( location ) }`);
				Log.error( JSON.stringify( error ) );

				reject( error );
			}
			else {
				Log.verbose(`Successfully read ${ Chalk.yellow( location ) }`);

				resolve( content );
			}
		});
	});
};


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

	if( dependencies ) {
		if( Object.keys( dependencies ).length ) {
			const baseLocation = Path.normalize(`${ location }/../`);

			for( const dependency of Object.keys( dependencies ) ) {
				const modulePath = dependency.split('/')[ 1 ];

				sass += `@import "${ Path.normalize(`${ baseLocation }/${ modulePath }/lib/sass/_module.scss`) }";\n`;
			}
		}

	}

	sass += `@import "${ Path.normalize(`${ location }/lib/sass/_module.scss`) }";\n`;

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
const Sassify = ( location, settings, sass ) => {
	return new Promise( ( resolve, reject ) => {
		const compiled = Sass.render({
			data: sass,
			indentType: 'tab', //this is how real developers indent!
			outputStyle: settings.minified ? 'compressed' : 'expanded',
		}, ( error, renered ) => {
			if( error ) {
				Log.error(`Sass compile failed for ${ Chalk.yellow( location ) }`);

				reject( error.message );
			}
			else {
				Log.verbose(`Successfully compiled Sass for ${ Chalk.yellow( location ) }`);

				Postcss([ Autoprefixer({ browsers: settings.browsers }) ])
					.process( renered.css )
					.catch( error => reject( error ) )
					.then( ( prefixed ) => {
						if( prefixed ) {
							prefixed
								.warnings()
								.forEach( warn => Log.error( warn.toString() ) );

							Log.verbose(`Successfully autoprefixed CSS for ${ Chalk.yellow( location ) }`);

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


/**
 * Minify JS so we have one function not several
 *
 * @param  {string} js   - The JS code to be minified
 * @param  {string} file - The file name for error reporting
 *
 * @return {string}      - The minified js code
 */
const MinifyJS = ( js, file ) => {

	try {
		const jsCode = UglifyJS.minify( js, {
			fromString: true,
		});

		return jsCode.code;
	}
	catch( error ) {
		Log.error(`Unable to uglify js code for ${ Chalk.yellow( file ) }`);
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
 *
 * @return {promise object}  - The js code either minified or bare bone
 */
const HandelJS = ( from, settings, to ) => {
	return new Promise( ( resolve, reject ) => {
		ReadFile( from ) //read the module
			.catch( error => {
				Log.error(`Unable to read file ${ Chalk.yellow( from ) }`);
				Log.error( error );

				reject( error );
			})
			.then( ( content ) => {

				let code = '';

				if( settings.minified ) { //minification = uglify code
					code = MinifyJS( content, from );

					Log.verbose(`Successfully uglified JS for ${ Chalk.yellow( from ) }`);
				}
				else { //no minification = just copy and rename
					code = content;
				}

				if( settings.modules ) { //are we saving modules?
					WriteFile( to, code ) //write the generated content to file and return its promise
						.catch( error => {
							Log.error( error );

							reject( error );
						})
						.then( () => {
							resolve( content );
					});
				}
				else {
					resolve( content ); //just return the promise
				}
		});
	});
};


/**
 * Minify all js modules together once their promises have resolved
 *
 * @param  {array}  allJS    - An array of promise object for all js modules which will return their code
 * @param  {object} settings - The SettingsJS object
 *
 * @return {promise object}  - Returns true once the promise is resolved
 */
const MinifyAllJS = ( allJS, settings ) => {
	return new Promise( ( resolve, reject ) => {
		Promise.all( allJS )
			.catch( error => {
				Log.error(`Compiling JS ran into an error: ${ error }`);
			})
			.then( ( js ) => {
				const locationJS = Path.normalize(`${ pkgPath }/${ settings.location }/${ settings.name }`);
				let code = '';

				if( settings.minified ) {
					code = MinifyJS( js.join(`\n\n`), locationJS );

					Log.verbose(`Successfully uglified JS for ${ Chalk.yellow( locationJS ) }`);
				}
				else {
					code = js.join(`\n\n`);
				}

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


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reading and merging settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
//reading local settings
const PackagePath = Path.normalize(`${ pkgPath }/package.json`);
let PKGsource = {};
let PKG = {};

try {
	PKGsource = Fs.readFileSync( PackagePath, `utf8` );
	PKG = JSON.parse( PKGsource );

	Log.verbose(`Read settings at ${ Chalk.yellow( PackagePath ) }`);
}
catch( error ) {
	Log.verbose(`No package.json found at ${ Chalk.yellow( PackagePath ) }`);
}

if( PKG.pancake === undefined ) { //let's make merging easy
	PKG.pancake = {};
}

//check local settings if syrup should run at all when coming from batter
if( PKG.pancake['auto-syrup'] === false && Program.batter ) {
	Log.verbose(`Syrup is disabled via local settings. Stopping here!`);

	process.exit( 0 );
}

//default settings
let SettingsCSS = {
	'minified': true,
	'modules': false,
	'browsers': [ 'last 2 versions', 'ie 8', 'ie 9', 'ie 10' ],
	'location': 'pancake/css/',
	'name': 'pancake.min.css',
};

let SettingsSASS = {
	'modules': false,
	'location': 'pancake/sass/',
	'name': 'pancake.scss',
};

let SettingsJS = {
	'minified': true,
	'modules': false,
	'location': 'pancake/js/',
	'name': 'pancake.min.js',
}


//merging default settings with local package.json
Object.assign( SettingsCSS, PKG.pancake.css );
Object.assign( SettingsSASS, PKG.pancake.sass );
Object.assign( SettingsJS, PKG.pancake.js );

Log.verbose(`Merged local settings with defaults:\n` +
	Chalk.yellow(
		`SettingsCSS:  ${ JSON.stringify( SettingsCSS ) }\n` +
		`SettingsSASS: ${ JSON.stringify( SettingsSASS ) }\n` +
		`SettingsJS:   ${ JSON.stringify( SettingsJS ) }`
	)
);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Going through all modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const allPackages = pancakes.GetPackages( pkgPath ) //read all packages and return an object per module
	.catch( error => {
		Log.error( error );

		process.exit( 1 );
});

allPackages
	.catch( error => {
		Log.error(`Trying to read all package.json files just bumped into an error: ${ error }`);
	})
	.then( allModules => {  //once we got all the content from all package.json files
		let compiledAll = []; //for collect all promises
		let allSass = '';     //all modules to be collected for SettingsCSS.name file
		let allJS = [];       //all js file paths from all pancake modules


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Saving settings into local package.json
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		//only save if we found pancake modules and it wasn't disabled by either flag or package.json setting
		if( allModules.length > 0 && !Program.nosave && PKG.pancake['auto-save'] !== false ) {
			Log.verbose(`Saving settings into ${ Chalk.yellow( PackagePath ) }`);

			PKG.pancake.css = SettingsCSS;
			PKG.pancake.sass = SettingsSASS;
			PKG.pancake.js = SettingsJS;

			let _isSpaces;

			//detect indentation
			let indentation = 2; //default indentation even though you all should be using tabs for indentation!
			try {
				const PKGlines = PKGsource.split('\n');
				_isSpaces = PKGlines[ 1 ].startsWith('  ');
			}
			catch( error ) {
				_isSpaces = true;
			}

			if( !_isSpaces ) {
				indentation = '\t'; //here we go!
			}

			compiledAll.push(
				WriteFile( PackagePath, JSON.stringify( PKG, null, indentation ) )  //write package.json
					.catch( error => {
							Log.error( error );
					})
			);
		}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Iterate over each module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		let sassVersioning = true; //let's assume the pancake module was build with sass-versioning

		for( const modulePackage of allModules ) {
			Log.verbose(`Bulding ${ Chalk.yellow( modulePackage.name ) }`);

			//generate the import statements depending on dependencies
			let sass = GenerateSass( modulePackage.path, modulePackage.peerDependencies );
			allSass += sass; //for SettingsCSS.name file

			//adding banner and conditional sass-versioning
			if( modulePackage.sassVersioning === true ) {
				sassVersioning = true; //setting this if we encounter at least one module with sass-versioning enabled

				sass = `/* ${ modulePackage.name } v${ modulePackage.version } */\n\n${ sass }\n@include versioning-check();\n`;
			}
			else {
				sass = `/* ${ modulePackage.name } v${ modulePackage.version } */\n\n${ sass }\n`;
			}

			//write css file
			if( SettingsCSS.modules ) {
				const location = Path.normalize(`${ pkgPath }/${ SettingsCSS.location }/${ modulePackage.name.split('/')[ 1 ] }.css`);

				compiledAll.push(
					Sassify( location, SettingsCSS, sass ) //generate css and write file
						.catch( error => {
							Log.error( error );
					})
				);
			}

			//write sass file
			if( SettingsSASS.modules ) {
				const location = Path.normalize(`${ pkgPath }/${ SettingsSASS.location }/${ modulePackage.name.split('/')[ 1 ] }.scss`);

				compiledAll.push(
					WriteFile( location, sass ) //write file
						.catch( error => {
							Log.error( error );

							process.exit( 1 );
					})
				);
			}

			//check if there is JS
			const jsModulePath = Path.normalize(`${ modulePackage.path }/lib/js/module.js`);

			if( Fs.existsSync( jsModulePath ) ) {
				Log.verbose(`${ Chalk.green('⌘') } Found JS code in ${ Chalk.yellow( modulePackage.name ) }`);

				const jsModuleToPath = Path.normalize(`${ pkgPath }/${ SettingsJS.location }/${ modulePackage.name.split('/')[ 1 ] }.js`);

				const jsPromise = HandelJS( jsModulePath, SettingsJS, jsModuleToPath ) //compile js and write to file depending on settings
					.catch( error => {
						Log.error( error );
				});

				allJS.push( jsPromise );       //collect all js only promises so we can save the SettingsJS.name file later
				compiledAll.push( jsPromise ); //add them also to the big queue so we don't run into race conditions
			}
		}

		if( allModules.length > 0 ) {

			//write the SettingsCSS.name file
			const locationCSS = Path.normalize(`${ pkgPath }/${ SettingsCSS.location }/${ SettingsCSS.name }`);
			const Package = require( Path.normalize(`${ __dirname }/../package.json`) ); //for displaying help and version

			if( sassVersioning === true ) {
				allSass = `/* PANCAKE v${ Package.version } */\n\n${ StripDuplicateLines( allSass ) }\n\n@include versioning-check();\n`;
			}
			else {
				allSass = `/* PANCAKE v${ Package.version } */\n\n${ StripDuplicateLines( allSass ) }\n`;
			}

			compiledAll.push(
				Sassify( locationCSS, SettingsCSS, allSass ) //generate SettingsCSS.name file
					.catch( error => {
						Log.error( error );
				})
			);

			//write SettingsSASS.name file
			if( SettingsSASS.name !== false ) {
				const locationSASS = Path.normalize(`${ pkgPath }/${ SettingsSASS.location }/${ SettingsSASS.name }`);

				compiledAll.push(
					WriteFile( locationSASS, allSass ) //write file
						.catch( error => {
							Log.error( error );

							process.exit( 1 );
					})
				);
			}

			//write SettingsJS.name file
			compiledAll.push(
				MinifyAllJS( allJS, SettingsJS )
					.catch( error => {
						Log.error( error );
				})
			);


			//after all files have been compiled and written
			Promise.all( compiledAll )
				.catch( error => {
					pancakes.Loading.stop(); //stop loading animation

					Log.error(`Compiling Sass ran into an error: ${ error }`);
				})
				.then( () => {
					pancakes.Loading.stop(); //stop loading animation

					Log.ok( `Your delicious pancake is ready to be consumed 💥` );
			});
	}
	else {
		pancakes.Loading.stop(); //stop loading animation

		Log.info( `No pancake modules found 😬` );
	}
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on( 'exit', pancakes.ExitHandler.bind( null, { now: Program.batter ? true : false } ) );              //on closing
process.on( 'SIGINT', pancakes.ExitHandler.bind( null, { now: true } ) );             //on [ctrl] + [c]
process.on( 'uncaughtException', pancakes.ExitHandler.bind( null, { now: true } ) );  //on uncaught exceptions
