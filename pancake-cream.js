#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * CREAM 👀
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
const Program = require('commander');
const Inquirer = require('inquirer');
const Request = require('request');
const Semver =  require('semver');
const Chalk = require('chalk');
const Path = require(`path`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
let pkgPath = Path.normalize(`${ process.cwd() }/`); //default value of the pkgPath path

Program
	.usage( `[command] <input> <option>` )
	.arguments('<pkgPath>')
	.action( pkgPathArgument => {
		pkgPath = pkgPathArgument; //overwriting default value with user input
	})
	.option( `-v, --verbose`, `Run the program in verbose mode` )
	.parse( process.argv );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const pancakes = require(`./pancake-utilities.js`)( Program.verbose );
const Log = pancakes.Log;
const UIKITurl = `https://raw.githubusercontent.com/govau/uikit/master/uikit.json?${ Math.floor( new Date().getTime() / 1000 ) }`; //breaking caching here


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

					reject( error );
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

	if( Semver.major( oldVersion ) !== Semver.major( newVersion ) ) {
		return `${ Semver.major( newVersion ) }.${ Semver.minor( newVersion ) }.${Chalk.green(`${ Semver.patch( newVersion ) }`)}`;
	}
};


/**
 * Return a Inquirer separator used as a headline
 *
 * @param  {string} headline - Text for headline
 * @param  {string} subline  - [optional] Text for subline
 *
 * @return {object}          - The Inquirer.Separator object
 */
const Headline = ( headline, subline = '' ) => {
	return new Inquirer.Separator(`\n   ════╡ ${ headline } ╞════${ subline.length > 0 ? `\n   ${ Chalk.gray( subline ) }` : `` }`);
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Cream
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info(`PANCAKE PUTTING THE CREAM ON TOP`);

pancakes.Loading.start(); //start loading animation

let allPromises = []; //collect both promises

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get uikit.json
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.verbose(`Getting uikit.json from: ${ Chalk.yellow( UIKITurl ) }`);

const gettingUikit = GetRemoteJson( UIKITurl ); //get the uikig json
let UIKIT = {};                                 //for uikit data in a larger scope

gettingUikit.then( data => {
	UIKIT = data; //adding the data of uikit.json into our scoped variable
});

allPromises.push( gettingUikit ); //keep track of all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get uikit modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
let allModules = {}; //for all modules in a larger scope

const allPackages = pancakes.GetPackages( pkgPath ); //read all packages and return an object per module

allPackages.then( data => {
	allModules = data; //adding all uikit modules into our scoped variable
});

allPromises.push( allPackages ); //keep track of all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Start compiling what we have vs what we could have
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Promise.all( allPromises )
	.catch( error => {
		pancakes.Loading.stop(); //stop loading animation

		Log.error(`An error occurred getting the basics: ${ error }`);
	})
	.then( () => {
		pancakes.Loading.stop(); //stop loading animation

		let choices = [];          //to be filled with all choices we have
		let installed = new Map(); //to be filled with installed modules

		//convert installed modules array into map for better querying
		for( const modulePackage of allModules ) {
			installed.set( modulePackage.name, modulePackage.version );
		}

		//getting the longest name of all uikit modules
		const longestName = Object.keys( UIKIT ).reduce( ( a, b) => a.length > b.length ? a : b ).length - ( pancakes.npmOrg.length + 1 );

		Log.verbose(
			`Got all data from uikit.json and installed modules:\n` +
			`Installed: ${ Chalk.yellow( JSON.stringify( [ ... installed ] ) ) }\n` +
			`UIKIT:     ${ Chalk.yellow( JSON.stringify( UIKIT ) ) }`
		);

		choices.push( Headline( `Easy upgrades`,`Below upgrades are backwards compatible` ) );

		//iterate over all uikit modules
		for( const module of Object.keys( UIKIT ) ) {
			const thisChoice = {};                            //let's build this choice out
			const installedVersion = installed.get( module ); //the installed version of this module
			const name = module.substring( pancakes.npmOrg.length + 1, module.length );

			thisChoice.name = `${ name }  ` +
				`${ ' '.repeat( longestName - name.length ) }` +
				`v${ UIKIT[ module ].version }`; //we add each module of the uikit in here

			thisChoice.value = {
				[ module ]: UIKIT[ module ].version, //let's make sure we can parse the answer
			};

			if( installedVersion !== undefined ) { //in case we have this module already installed, let's check if you can upgrade
				if(
					Semver.gte( UIKIT[ module ].version, installedVersion ) && //if this version is newer than the installed one
					!Semver.eq( UIKIT[ module ].version, installedVersion )    //and not equal
				) {

					const newVersion = HighlightDiff( installedVersion, UIKIT[ module ].version );

					thisChoice.name = `${ name }  ` +
						`${ ' '.repeat( longestName - name.length ) }` +
						`v${ installedVersion }   >   ${ newVersion }   **NEWER VERSION AVAILABLE**`; //this is actually an upgrade
				}

				if( Semver.eq( UIKIT[ module ].version, installedVersion ) ) { //if this version is the same as what's installed
					thisChoice.disabled = Chalk.gray('installed');
				}
			}

			choices.push( thisChoice ); //adding to all checkboxes
		}

		choices.push( Headline( `Danger zone`,`Below upgrades come with breaking changes.` ) );

		Log.space(); //prettiness

		Inquirer.prompt([
			{
				type: 'checkbox',
				message: 'Select your UI-Kit modules',
				name: 'modules',
				choices: choices,
				validate: ( answer ) => {
					if( answer.length < 1 ) {
						return 'You must choose at least one module to install.';
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