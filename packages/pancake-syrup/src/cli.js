/***************************************************************************************************************************************************************
 *
 * Running pancake inside a cli
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
import StripAnsi from 'strip-ansi';
import Inquirer from 'inquirer';
import Path from 'path';
import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { ExitHandler, CheckNPM, Size, Log, Style, Loading, ParseArgs, Settings, Cwd, Semver, GetModules, Spawning } from '@gov.au/pancake';
import { HighlightDiff, Headline } from './prettiness.js';
import { AddDeps } from './dependencies.js';
import { GetRemoteJson } from './json.js';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Running the program in CLI
 *
 * @param  {array} argv - The arguments passed to node
 */
export const init = ( argv = process.argv ) => {
	const pkg = require( Path.normalize(`${ __dirname }/../package.json`) );

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Verbose flag
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let verbose = false;
	if( process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--verbose') !== -1 ) {
		Log.verboseMode = true;
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check npm version
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	const npmVersion = CheckNPM();

	//npm 3 and higher is required
	if( !npmVersion ) {
		Log.error(`Syrup only works with npm 3 and later.`);
		Log.space();
		process.exit( 1 );
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get global settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGS = Settings.GetGlobal( __dirname );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Parsing cli arguments
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	const ARGS = ParseArgs( SETTINGS, argv );

	//arg overwrites
	SETTINGS.npmOrg = ARGS.org;
	SETTINGS.json = ARGS.json;


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Set global settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.set.length > 0 ) {
		SETTINGS = Settings.SetGlobal( __dirname, SETTINGS, ...ARGS.set );

		Loading.stop();
		Log.space();
		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Display help
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.help ) {
		Log.info(`Pancake help`);
		Loading.stop();

		if( Size().width > 110 ) { //only show if we have enough space
		}

		console.log(
			Style.yellow(`\n  ( ^-^)_旦\n\n`) +
			`  Syrup makes working with Pancake modules easier and sweat.\n` +
			`  ${ Style.gray(`${ String.repeat(`-`, Size().width > 114 ? 110 : Size().width - 4 ) }\n\n`) }` +
			`  ${ Style.bold(`PATH`) }            - Run pancake in a specific path and look for pancake modules there.\n` +
			`    $ ${ Style.yellow(`pancake /Users/you/project/folder`) }\n\n` +
			`  ${ Style.bold(`SETTINGS`) }        - Set global settings. Available settings are: ${ Style.yellow( Object.keys( SETTINGS ).join(', ') ) }.\n` +
			`    $ ${ Style.yellow(`pancake --set npmOrg "@yourOrg" "@anotherOrg"`) }\n` +
			`    $ ${ Style.yellow(`pancake --set ignorePlugins @gov.au/pancake-sass,@gov.au/pancake-svg`) }\n\n` +
			`  ${ Style.bold(`ORG`) }             - Change the org scope of the pancake modules you like to use.\n` +
			`    $ ${ Style.yellow(`pancake --org "@your.org"`) }\n\n` +
			`  ${ Style.bold(`JSON`) }            - Temporarily overwrite the address to the json file of all your pancake modules.\n` +
			`    $ ${ Style.yellow(`pancake --json https://domain.tld/pancake-modules.json`) }\n\n` +
			`  ${ Style.bold(`HELP`) }            - Display the help (this screen).\n` +
			`    $ ${ Style.yellow(`pancake --help`) }\n\n` +
			`  ${ Style.bold(`VERSION`) }         - Display the version of pancake.\n` +
			`    $ ${ Style.yellow(`pancake --version`) }\n\n` +
			`  ${ Style.bold(`VERBOSE`) }         - Run pancake in verbose silly mode\n` +
			`    $ ${ Style.yellow(`pancake --verbose`) }`
		);

		Log.space();
		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Finding the current working directory
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	const pkgPath = Cwd( ARGS.cwd );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get local settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( !Fs.existsSync( Path.normalize(`${ pkgPath }/package.json`) ) ) {
		Spawning.sync( 'npm', [ 'init', '--yes' ] );
	}

	let SETTINGSlocal = Settings.GetLocal( pkgPath );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Display version
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.version ) {
		console.log(`v${ pkg.version }`);

		if( ARGS.verbose ) { //show some space if we had verbose enabled
			Log.space();
		}

		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Show banner
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	Log.info(`PUTTING SYRUP ON YOUR PANCAKE`);

	let allPromises = []; //collect both promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Getting json file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	Loading.start();

	let PANCAKE = {}; //for pancake data in a larger scope

	const gettingJSON = GetRemoteJson(`${ SETTINGS.json }?${ Math.floor( new Date().getTime() / 1000 ) }`) //get the json file and break caching
		.catch( error => {
			Log.error( error );

			process.exit( 1 );
		})
		.then( data => {
			PANCAKE = data; //adding the data of the json file into our scoped variable
	});

	allPromises.push( gettingJSON ); //keep track of all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get pancake modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let allModules = {}; //for all modules in a larger scope

	const allPackages = GetModules( pkgPath, SETTINGS.npmOrg ) //read all packages and return an object per module
		.catch( error => {
			Log.error( error );

			process.exit( 1 );
		})
		.then( data => {
			allModules = data; //adding all pancake modules into our scoped variable
	});

	allPromises.push( allPackages ); //keep track of all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Start compiling what we have vs what we could have
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	Promise.all( allPromises )
		.catch( error => {
			Loading.stop(); //stop loading animation

			Log.error(`An error occurred getting the basics right: ${ error }`); //I hope that never happens ;)

			process.exit( 1 );
		})
		.then( () => {
			Loading.stop(); //stop loading animation

			let choices = [];          //to be filled with all choices we have
			let easyChoices = [];      //to be filled with all easy upgradeable non-breaking modules
			let hardChoices = [];      //to be filled with all modules with breaking changes
			let installed = new Map(); //to be filled with installed modules

			//convert installed modules array into map for better querying
			for( const modulePackage of allModules ) {
				installed.set( modulePackage.name, modulePackage.version );
			}

			//getting the longest name of all pancake modules for nice alignment
			const longestName = Object.keys( PANCAKE ).reduce( ( a, b) => a.length > b.length ? a : b ).length - ( SETTINGS.npmOrg.length + 1 );

			Log.verbose(
				`Got all data from the json file and installed modules:\n` +
				`Installed: ${ Style.yellow( JSON.stringify( [ ...installed ] ) ) }\n` +
				`PANCAKE:   ${ Style.yellow( JSON.stringify( PANCAKE ) ) }`
			);

			//iterate over all pancake modules
			for( const module of Object.keys( PANCAKE ) ) {
				const thisChoice = {};                            //let’s build this choice out
				const installedVersion = installed.get( module ); //the installed version of this module
				const name = module.split('/')[ 1 ];              //removing the scoping string

				const depLines = AddDeps( PANCAKE[ module ].peerDependencies, installed, longestName );  //let’s add all the dependencies under each module

				thisChoice.name = ` ${ name }  ` +
					`${ ' '.repeat( longestName - name.length ) }` +
					` ${ PANCAKE[ module ].version }`; //we add each module of the json file in here

				thisChoice.value = { //let’s make sure we can parse the answer
					name: module,
					version :PANCAKE[ module ].version,
					dependencies: PANCAKE[ module ].peerDependencies,
					breaking: [ ...depLines.breaking ],
				};


				//now let's see where to put it?
				if( installedVersion === undefined && !depLines.breakage ) { //in case we don’t have this module already installed and no dependencies breaks anything
					easyChoices.push( thisChoice );                             //so this is a new module
					easyChoices.push( ...depLines.lines );
				}
				else if( !depLines.breakage ) { //this module is already installed and doesn’t break in any of it’s dependencies
					if(
						Semver.gte( PANCAKE[ module ].version, installedVersion ) && //if this version is newer than the installed one
						!Semver.eq( PANCAKE[ module ].version, installedVersion )    //and not equal
					) {
						const newVersion = HighlightDiff( installedVersion, PANCAKE[ module ].version );

						thisChoice.name = ` ${ name }  ` +
							`${ ' '.repeat( longestName - name.length ) }` +
							` ${ newVersion }   ^   ${ installedVersion }   ${ Style.gray( 'installed' ) }`; //this is actually an upgrade

						if( Semver.major( installedVersion ) !== Semver.major( PANCAKE[ module ].version ) ) {

							//adding this module to the modules that will break backwards compatibility
							thisChoice.value.breaking.push(`${ module }@${ PANCAKE[ module ].version }`);

							hardChoices.push( thisChoice ); //this is a breaking change upgrade
							hardChoices.push( ...depLines.lines );
						}
						else {
							easyChoices.push( thisChoice ); //this is an easy upgrade
							easyChoices.push( ...depLines.lines );
						}
					}
				}

				if( depLines.breakage ) {         //some of this modules dependencies breaks backwards compatibility
					hardChoices.push( thisChoice ); //so this is a breaking change upgrade
					hardChoices.push( ...depLines.lines );
				}
			}

			//if we even have choices left
			if( [...easyChoices, ...hardChoices].length == 0 ) {
				Log.ok(`There are no modules you haven’t already installed`);
			}
			else {
				//find the longest line in all choices
				let longestLine = [...easyChoices, ...hardChoices].reduce( ( a, b ) => {
					let aLine = a.name || a.line;
					let bLine = b.name || b.line;

					return aLine.length > bLine.length ? a : b;
				});

				longestLine = longestLine.name ? StripAnsi( longestLine.name ).length : StripAnsi( longestLine.line ).length;


				//counting output lines so we only show scrolling if the terminal is not high enough
				let lines = 2;


				//adding headlines and choices
				if( easyChoices.length ) {
					choices.push( ...Headline( `Easy zone`,`Below modules are backwards compatible`, longestLine ) );
					choices.push( ...easyChoices ); //merging in options

					lines += easyChoices.length + 3; //headline plus choices
				}

				if( hardChoices.length ) {
					choices.push( ...Headline( `Danger zone`,`Below modules come with breaking changes`, longestLine ) );
					choices.push( ...hardChoices ); //merging in options

					lines += hardChoices.length + 3; //headline plus choices
				}

				Log.space(); //prettiness

				//make sure the viewport is respected
				if( lines => ( Size().height - 3 ) ) {
					lines = Size().height - 3;
				}

				//render the prompt
				Inquirer.prompt([
					{
						type: 'checkbox',
						message: 'Select your pancake modules',
						name: 'modules',
						pageSize: lines,
						choices: choices,
						validate: ( answer ) => {
							if( answer.length < 1 ) {
								return 'You must choose at least one module to install or quit the program.';
							}

							return true;
						}
					}
				]).then(( answer ) => {
					Log.verbose(`Got answer:\n${ Style.yellow( JSON.stringify( answer.modules ) ) }`);

					//checking if we got yarn installed
					// const command = Spawning.sync( 'yarn', [ '--version' ] );
					// const hasYarn = command.stdout && command.stdout.toString().trim() ? true : false;
					const hasYarn = false; //disabled yarn as it has some issues

					Log.verbose(`Yarn ${ Style.yellow( hasYarn ? 'was ' : 'was not ' ) }detected`);

					let breaking;
					let modules = [];

					for( const module of answer.modules ) {
						modules.push(`${ module.name }@${ module.version }`);

						if( module.breaking.length > 0 ) { //collecting all modules with breaking changes
							if( breaking !== undefined ) {
								breaking.push( ...module.breaking );
							}
							else {
								breaking = module.breaking;
							}
						}
					}

					//
					Log.space(); //prettiness

					let installing; //for spawning our install process

					//installing modules
					if( hasYarn ) {
						installing = Spawning.async( 'yarn', [ 'add', ...modules ], { cwd: pkgPath, stdio: 'inherit' } );
					}
					else {
						installing = Spawning.async( 'npm', [ 'install', '--save', ...modules ], { cwd: pkgPath, stdio: 'inherit' } );
					}

					//if things went south
					installing.catch( error => {
						//let’s output a way out, a way forward maybe?
						Log.error(
							`An error has occurred while attemptying to install your chosen modules.\n` +
							`You can attempt to install those modules yourself by running:\n\n` +
							Style.yellow(`yarn add ${ modules.join(' ') }\n\n`) +
							`or\n\n` +
							Style.yellow(`npm install ${ modules.join(' ') }`)
						);

						Log.verbose( error );

						process.exit( 1 ); // :(
					});

					installing.then( code => {
						Log.verbose(`Finished installing modules: ${ Style.yellow( modules.join(', ') ) }`);

						Log.info(
							`Modules installed:\n${ Style.yellow( modules.join('\n') ) }` +
							( breaking === undefined ? '' : `\n\nModules and dependencies with breaking changes:\n${ Style.yellow( breaking.join('\n') ) }` )
						);
					});
				});
			}
	});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	process.on( 'exit', ExitHandler.bind( null, { withoutSpace: false } ) );              //on closing
	process.on( 'SIGINT', ExitHandler.bind( null, { withoutSpace: false } ) );            //on [ctrl] + [c]
	process.on( 'uncaughtException', ExitHandler.bind( null, { withoutSpace: false } ) ); //on uncaught exceptions
}
