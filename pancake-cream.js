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

console.log(PANCAKEurl);


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
					Log.error(`Status code of request to ${ Chalk.yellow( url ) } returned: ${ Chalk.yellow( result.statusCode ) } `);

					reject( result.statusCode );
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
		return Chalk.green( newVersion );
	}

	if( Semver.minor( oldVersion ) !== Semver.minor( newVersion ) ) {
		return `${ Semver.major( newVersion ) }.${Chalk.green(`${ Semver.minor( newVersion ) }.${ Semver.patch( newVersion ) }`)}`;
	}

	if( Semver.patch( oldVersion ) !== Semver.patch( newVersion ) ) {
		return `${ Semver.major( newVersion ) }.${ Semver.minor( newVersion ) }.${Chalk.green(`${ Semver.patch( newVersion ) }`)}`;
	}
};


/**
 * Return a couple Inquirer separator used as a headline
 *
 * @param  {string} headline    - Text for headline
 * @param  {string} subline     - [optional] Text for subline
 * @param {integer} longestName - The max length of all lines we can center align the headline
 *
 * @return {object}          - The Inquirer.Separator object
 */
const Headline = ( headline, subline = '', longestName ) => {
	const side = ( longestName - ( 4 * 2 ) - headline.length ) / 2; //calculate the sides

	return [
		new Inquirer.Separator(` `),
		new Inquirer.Separator( Chalk.reset.bgBlue.cyan(`  ═${ '═'.repeat( side ) }╡ ${ headline } ╞${ '═'.repeat( side ) }═  `) ),
		new Inquirer.Separator(`${ subline.length > 0 ? `  ${ Chalk.reset.bold.gray( subline ) }` : `` }`),
	];
};


/**
 * Check all dependencies against installed modules and return what breakage might occur
 *
 * @param  {object} dependencies - [description]
 * @param  {map}    installed    - [description]
 *
 * @return {string}              - [description]
 */
const CheckDeps = ( dependencies, installed ) => {
	Log.verbose(
		`Checking dependencies: ${ Chalk.yellow( JSON.stringify( dependencies ) ) } against installed: ${ Chalk.yellow( JSON.stringify( [ ... installed] ) ) }`
	);

	for( const module of Object.keys( dependencies ) ) {
		const installedModule = installed.get( module );

		console.log(module);
		console.log(dependencies[module]);
		console.log(installedModule);

		if( installedModule !== undefined ) {
			console.log('totally found it!');
			console.log( Semver.satisfies( installedModule, dependencies[ module ] ) );
		}
	}

	return 'patch';

};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Cream
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info(`PANCAKE PUTTING THE CREAM ON TOP`);

pancakes.Loading.start(); //start loading animation

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

let PANCAKE = {};                                //for pancake data in a larger scope

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
		let newChoices = [];       //to be filled with all new pancake modules
		let easyChoices = [];      //to be filled with all easy upgradeable non-breaking modules
		let hardChoices = [];      //to be filled with all modules with breaking changes
		let installedChoices = []; //to be filled with all modules that have been installed already
		let installed = new Map(); //to be filled with installed modules

		//convert installed modules array into map for better querying
		for( const modulePackage of allModules ) {
			installed.set( modulePackage.name, modulePackage.version );
		}

		//getting the longest name of all pancake modules for nice alignment
		const longestName = Object.keys( PANCAKE ).reduce( ( a, b) => a.length > b.length ? a : b ).length - ( pancakes.npmOrg.length + 1 );
		let longestLine = longestName;

		Log.verbose(
			`Got all data from the json file and installed modules:\n` +
			`Installed: ${ Chalk.yellow( JSON.stringify( [ ... installed ] ) ) }\n` +
			`PANCAKE:   ${ Chalk.yellow( JSON.stringify( PANCAKE ) ) }`
		);

		//iterate over all pancake modules
		for( const module of Object.keys( PANCAKE ) ) {
			const thisChoice = {};                            //let's build this choice out
			const installedVersion = installed.get( module ); //the installed version of this module
			const name = module.substring( pancakes.npmOrg.length + 1, module.length );

			thisChoice.name = `${ name }  ` +
				`${ ' '.repeat( longestName - name.length ) }` +
				`v${ PANCAKE[ module ].version }`; //we add each module of the json file in here

			thisChoice.value = {
				[ module ]: PANCAKE[ module ].version, //let's make sure we can parse the answer
			};

			//now let's see where to put it?
			if( installedVersion === undefined ) { //in case we have this module already installed, let's check if you can upgrade

				console.log( CheckDeps( PANCAKE[ module ].peerDependencies, installed ));
				newChoices.push( thisChoice );       //this is a new module
			}
			else { //this module is already installed
				if(
					Semver.gte( PANCAKE[ module ].version, installedVersion ) && //if this version is newer than the installed one
					!Semver.eq( PANCAKE[ module ].version, installedVersion )    //and not equal
				) {
					const newVersion = HighlightDiff( installedVersion, PANCAKE[ module ].version );

					thisChoice.name = `${ name }  ` +
						`${ ' '.repeat( longestName - name.length ) }` +
						`v${ installedVersion }   >   ${ newVersion }   **NEWER VERSION AVAILABLE**`; //this is actually an upgrade

					if( Semver.major( installedVersion ) !== Semver.major( PANCAKE[ module ].version ) ) {
						hardChoices.push( thisChoice ); //this is a breaking change upgrade
					}
					else {
						easyChoices.push( thisChoice ); //this is an easy upgrade
					}
				}

				if( Semver.eq( PANCAKE[ module ].version, installedVersion ) ) { //if this version is the same as what's installed
					thisChoice.disabled = Chalk.gray('installed');

					installedChoices.push( thisChoice ); //already installed module
				}
			}

			if( StripAnsi( thisChoice.name ).length > longestLine ) {
				longestLine = StripAnsi( thisChoice.name ).length;
			}
		}

		let lines = 2; //counting output lines

		//building options object
		if( installedChoices.length ) {
			choices.push( ...Headline( `Already installed modules`,`Below modules are already installed`, longestLine ) );
			choices.push( ...installedChoices ); //merging in options

			lines += installedChoices.length + 2; //headline plus choices
		}

		if( newChoices.length ) {
			choices.push( ...Headline( `New modules`,`Below modules can be newly installed`, longestLine ) );
			choices.push( ...newChoices ); //merging in options

			lines += newChoices.length + 3; //headline plus choices
		}

		if( easyChoices.length ) {
			choices.push( ...Headline( `Easy zone`,`Below modules are backwards compatible`, longestLine ) );
			choices.push( ...easyChoices ); //merging in options

			lines += easyChoices.length + 3; //headline plus choices
		}

		if( hardChoices.length ) {
			choices.push( ...Headline( `Danger zone`,`Below modules come with breaking changes.`, longestLine ) );
			choices.push( ...hardChoices ); //merging in options

			lines += hardChoices.length + 3; //headline plus choices
		}

		Log.space(); //prettiness

		if( lines => ( Size.height - 3 ) ) {
			lines = Size.height - 3;
		}

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
		]).then(( modules ) => {

			console.log(JSON.stringify(modules, null, '  ')); //let's work from here :)

		});
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on( 'exit', pancakes.ExitHandler.bind( null, { now: false } ) );              //on closing
process.on( 'SIGINT', pancakes.ExitHandler.bind( null, { now: true } ) );             //on [ctrl] + [c]
process.on( 'uncaughtException', pancakes.ExitHandler.bind( null, { now: true } ) );  //on uncaught exceptions
