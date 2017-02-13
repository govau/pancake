#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * CREAM 👀
 *
 * The script helps you install pancake modules or checks for upgrades for you and presents you with a nice option list to see what to upgrade.
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
const Spawn = require( 'child_process' );
const StripAnsi = require('strip-ansi');
const Program = require('commander');
const Inquirer = require('inquirer');
const Size = require('window-size');
const Request = require('request');
const Semver =  require('semver');
const Chalk = require('chalk');
const Path = require(`path`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
let pkgPath = Path.normalize(`${ process.cwd() }/`); //default value of the pkgPath path
let PANCAKEurl = `https://raw.githubusercontent.com/govau/uikit/master/uikit.json`;

Program
	.usage( `[command] <input> <option>` )
	.arguments('<pkgPath>')
	.option( `-v, --verbose`,           `Run the program in verbose mode` )
	.option( `-j, --json [pancakeURL]`, `Overwrite the default json URL` )
	.action( ( pkgPathArgument, pancakeURL ) => {
		pkgPath = pkgPathArgument; //overwriting default value with user input
		PANCAKEurl = pancakeURL.json ? pancakeURL.json : PANCAKEurl;
	})
	.parse( process.argv );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const pancakes = require(`./pancake-utilities.js`)( Program.verbose );
const Log = pancakes.Log;
PANCAKEurl += `?${ Math.floor( new Date().getTime() / 1000 ) }`; //breaking caching here


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reusable functions
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Get remote json file and return it's data
 *
 * @param  {string} url - The URL of the remote json file
 *
 * @return {object}     - The parsed object of the json content
 */
const GetRemoteJson = url => {
	return new Promise( ( resolve, reject ) => {
		Request.get(
			{
				url: url,
				json: true,
				headers: {
					'User-Agent': 'pancake', //well, duh!
				},
			}, ( error, result, data ) => {
				if( error ) {
					Log.error( error );

					if( error.code === 'ENOTFOUND' ) {
						reject(`Unable to find the json file online. Make sure you’re online.`);
					}
					else {
						reject( error );
					}
				}
				else if( result.statusCode !== 200 ) {
					reject(`Request to ${ Chalk.yellow( url ) } returned: ${ Chalk.yellow( result.statusCode ) }`);
				}
				else {
					resolve( data );
				}
			}
		);
	});
};


/**
 * Highlight with green the changes of an semver version comparison
 *
 * @param  {string} oldVersion - Old version to compare against
 * @param  {string} newVersion - New version to highlight
 *
 * @return {string}            - Highlighted newVersion
 */
const HighlightDiff = ( oldVersion, newVersion ) => {
	if( !Semver.valid( oldVersion ) ) {
		Log.error(`Version is not a valid semver version: ${ Chalk.yellow( oldVersion ) }`);
	}

	if( !Semver.valid( newVersion ) ) {
		Log.error(`Version is not a valid semver version: ${ Chalk.yellow( newVersion ) }`);
	}

	if( Semver.major( oldVersion ) !== Semver.major( newVersion ) ) {
		return Chalk.magenta( newVersion );
	}

	if( Semver.minor( oldVersion ) !== Semver.minor( newVersion ) ) {
		return `${ Semver.major( newVersion ) }.${Chalk.magenta(`${ Semver.minor( newVersion ) }.${ Semver.patch( newVersion ) }`)}`;
	}

	if( Semver.patch( oldVersion ) !== Semver.patch( newVersion ) ) {
		return `${ Semver.major( newVersion ) }.${ Semver.minor( newVersion ) }.${Chalk.magenta(`${ Semver.patch( newVersion ) }`)}`;
	}
};


/**
 * Return a couple Inquirer separator used as a headline
 *
 * @param  {string}  headline    - Text for headline
 * @param  {string}  subline     - [optional] Text for subline
 * @param  {integer} longestName - The max length of all lines we can center align the headline
 *
 * @return {object}          - The Inquirer.Separator object
 */
const Headline = ( headline, subline = '', longestName ) => {
	const sideHeader = ( longestName - ( 4 * 2 ) - headline.length ) / 2; //calculate the sides for the headline for center alignment
	const sideSubline = ( longestName + 2 - subline.length ) / 2;         //calculate the sides for the subline for center alignment

	return [
		new Inquirer.Separator(` `),
		new Inquirer.Separator(
			Chalk.reset.bgBlue.cyan(`  ═${ '═'.repeat( Math.ceil( sideHeader ) ) }╡ ${ headline } ╞${ '═'.repeat( Math.floor( sideHeader ) ) }═  `)
		),
		new Inquirer.Separator(`${ subline.length > 0 ? `${ ' '.repeat( Math.floor( sideSubline ) ) }${ Chalk.reset.bold.gray( subline ) }` : `` }`),
	];
};


/**
 * Check all dependencies against installed modules and return what breakage might occur and an array of all dependencies
 *
 * @param  {object}  dependencies - All dependencies this module has
 * @param  {map}     installed    - All installed modules to check against
 * @param  {integer} longestName  - The longest name in our output so we can calculate spaces
 *
 * @return {object}               - { breakage: [boolean], lines: [array], breaking: [array] }
 */
const AddDeps = ( dependencies, installed, longestName ) => {
	Log.verbose(
		`Checking dependencies: ${ Chalk.yellow( JSON.stringify( dependencies ) ) } against installed: ${ Chalk.yellow( JSON.stringify( [ ...installed ] ) ) }`
	);

	let breakage = false; //we always assume the best
	let breaking = [];    //in here we collect all modules that will break to display at the end
	let lines = [];       //one line per dependency
	let i = 0;            //need to see what the last dependency is

	for( const module of Object.keys( dependencies ) ) {
		i ++; //count iterations
		let name = module.substring( pancakes.npmOrg.length + 1, module.length ); //removing npm scoping string
		let version = dependencies[ module ];
		const installedModule = installed.get( module ); //looking up if this version exists in our installed modules

		if( installedModule !== undefined && !Semver.satisfies( installedModule, version ) ) { //there is some breakage happening here
			breaking.push(`${ module }@${ version }`); //we need this for when we display what we've installed later

			//make it easy to read
			name = Chalk.magenta( name );
			version = Chalk.magenta( `${ version }   !   ${ installedModule }` );

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


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Cream
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info(`PANCAKE PUTTING THE CREAM ON TOP`);

pancakes.Loading.start(); //start loading animation

Log.verbose(`Cream running in ${ Chalk.yellow( pkgPath ) }`);

let allPromises = []; //collect both promises

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get json file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.verbose(`Getting json file from: ${ Chalk.yellow( PANCAKEurl ) }`);

const gettingJSON = GetRemoteJson( PANCAKEurl ) //get the json file
	.catch( error => {
		Log.error( error );

		process.exit( 1 );
});

let PANCAKE = {}; //for pancake data in a larger scope

gettingJSON.then( data => {
	PANCAKE = data; //adding the data of the json file into our scoped variable
});

allPromises.push( gettingJSON ); //keep track of all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get pancake modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
let allModules = {}; //for all modules in a larger scope

const allPackages = pancakes.GetPackages( pkgPath ) //read all packages and return an object per module
	.catch( error => {
		Log.error( error );

		process.exit( 1 );
});

allPackages.then( data => {
	allModules = data; //adding all pancake modules into our scoped variable
});

allPromises.push( allPackages ); //keep track of all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Start compiling what we have vs what we could have
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Promise.all( allPromises )
	.catch( error => {
		pancakes.Loading.stop(); //stop loading animation

		Log.error(`An error occurred getting the basics right: ${ error }`); //I hope that never happens ;)

		process.exit( 1 );
	})
	.then( () => {
		pancakes.Loading.stop(); //stop loading animation

		let choices = [];          //to be filled with all choices we have
		let easyChoices = [];      //to be filled with all easy upgradeable non-breaking modules
		let hardChoices = [];      //to be filled with all modules with breaking changes
		let installed = new Map(); //to be filled with installed modules

		//convert installed modules array into map for better querying
		for( const modulePackage of allModules ) {
			installed.set( modulePackage.name, modulePackage.version );
		}

		//getting the longest name of all pancake modules for nice alignment
		const longestName = Object.keys( PANCAKE ).reduce( ( a, b) => a.length > b.length ? a : b ).length - ( pancakes.npmOrg.length + 1 );

		Log.verbose(
			`Got all data from the json file and installed modules:\n` +
			`Installed: ${ Chalk.yellow( JSON.stringify( [ ...installed ] ) ) }\n` +
			`PANCAKE:   ${ Chalk.yellow( JSON.stringify( PANCAKE ) ) }`
		);

		//iterate over all pancake modules
		for( const module of Object.keys( PANCAKE ) ) {
			const thisChoice = {};                            //let's build this choice out
			const installedVersion = installed.get( module ); //the installed version of this module
			const name = module.substring( pancakes.npmOrg.length + 1, module.length ); //removing the scoping string
			const depLines = AddDeps( PANCAKE[ module ].peerDependencies, installed, longestName );  //let's add all the dependencies under each module

			thisChoice.name = ` ${ name }  ` +
				`${ ' '.repeat( longestName - name.length ) }` +
				` ${ PANCAKE[ module ].version }`; //we add each module of the json file in here

			thisChoice.value = { //let's make sure we can parse the answer
				name: module,
				version :PANCAKE[ module ].version,
				dependencies: PANCAKE[ module ].peerDependencies,
				breaking: [ ...depLines.breaking ],
			};

			//now let's see where to put it?
			if( installedVersion === undefined && !depLines.breakage ) { //in case we have this module already installed and neither it's dependencies break anything
				easyChoices.push( thisChoice );                             //so this is a new module
				easyChoices.push( ...depLines.lines );
			}
			else if( !depLines.breakage ) { //this module is already installed and doesn't break in any of it's dependencies
				if(
					Semver.gte( PANCAKE[ module ].version, installedVersion ) && //if this version is newer than the installed one
					!Semver.eq( PANCAKE[ module ].version, installedVersion )    //and not equal
				) {
					const newVersion = HighlightDiff( installedVersion, PANCAKE[ module ].version );

					thisChoice.name = ` ${ name }  ` +
						`${ ' '.repeat( longestName - name.length ) }` +
						` ${ newVersion }   ^   ${ installedVersion }   ${ Chalk.gray( 'installed' ) }`; //this is actually an upgrade

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
		if( lines => ( Size.height - 3 ) ) {
			lines = Size.height - 3;
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
			Log.verbose(`Got answer:\n${ Chalk.yellow( JSON.stringify( answer.modules ) ) }`);

			//checking if we got yarn installed
			const command = Spawn.spawnSync( 'yarn', [ '--version' ] );
			const hasYarn = command.stdout && command.stdout.toString().trim() ? true : false;

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

			Log.space(); //prettiness
			pancakes.Loading.start(); //start loading animation

			let installing; //for spawning our install process
			// modules = ['beast.js@0.1.4'];

			//installing modules
			if( hasYarn ) {
				installing = Spawn.spawn( 'yarn', [ 'add', ...modules ] );
			}
			else {
				installing = Spawn.spawn( 'npm', [ 'install', ...modules ] );
			}

			installing.stderr.on('data', (data) => {
				//let's output a way out, a way forward maybe?
				Log.error(
					`An error has occurred while attemptying to install your chosen modules.\n` +
					`You can attempt to install those modules yourself by running:\n\n` +
					Chalk.yellow(`yarn add ${ modules.join(' ') }\n\n`) +
					`or\n\n` +
					Chalk.yellow(`npm install ${ modules.join(' ') }`)
				);

				Log.verbose( data );

				pancakes.Loading.stop(); //stop loading animation

				process.exit( 1 ); // :(
			});

			installing.on('close', (code) => {
				Log.verbose(`Finished installing modules: ${ Chalk.yellow( modules.join(', ') ) }`);

				pancakes.Loading.stop(); //stop loading animation

				Log.info(
					`Modules installed:\n${ Chalk.yellow( modules.join('\n') ) }` +
					( breaking === undefined ? '' : `\n\nModules and dependencies with breaking changes:\n${ Chalk.yellow( breaking.join('\n') ) }` )
				);
			});

		});
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on( 'exit', pancakes.ExitHandler.bind( null, { now: false } ) );              //on closing
process.on( 'SIGINT', pancakes.ExitHandler.bind( null, { now: true } ) );             //on [ctrl] + [c]
process.on( 'uncaughtException', pancakes.ExitHandler.bind( null, { now: true } ) );  //on uncaught exceptions
