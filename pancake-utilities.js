#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * Pancake utilities
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const CFonts = require(`cfonts`);
const Chalk = require('chalk');


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Debugging prettiness
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

const Log = {
	output: false, //have we outputted something yet?

	/**
	 * Log an error
	 *
	 * @param  {string}  text - The text you want to log with the error
	 */
	error: ( text ) => {
		if( !Log.output ) { //if we haven't printed anything yet
			Log.space();      //only then we add an empty line on the top
		}

		CFonts.say(`Error`, { //we need something big to help npms error system
			colors: ['red', 'red'],
		});

		console.error(`🔥  ${ Chalk.red( `ERROR:   ${ text }` ) } `);

		Log.output = true; //now we have written something out
	},

	/**
	 * Log a message
	 *
	 * @param  {string}  text - The text you want to log
	 */
	info: ( text ) => {
		if( !Log.output ) {
			Log.space();
		}

		console.info(`🔔  INFO:    ${ text }`);
		Log.output = true;
	},

	/**
	 * Log success
	 *
	 * @param  {string}  text - The text you want to log
	 */
	ok: ( text ) => {
		if( !Log.output ) {
			Log.space();
		}

		console.info(`👍           ${ Chalk.green( text ) }`);
		Log.output = true;
	},

	/**
	 * Log a verbose message
	 *
	 * @param  {string}  text - The text you want to log
	 */
	verbose: ( text, verbose ) => {
		if( verbose ) {
			if( !Log.output ) {
				Log.space();
			}

			console.info(`😬  ${ Chalk.gray( `VERBOSE: ${ text }` ) }`);
			Log.output = true;
		}
	},

	/**
	 * Add some space to the output
	 */
	space: () => {
		console.log(`\n`);
	},

	/**
	 * Return true if we printed a message already
	 *
	 * @return {boolean} - Whether or not we've outputted something yet
	 */
	hadOutput: () => {
		return Log.output;
	},
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Handle exiting of program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
function ExitHandler( exiting, error ) {
	if( error ) {
		try { //try using our pretty output
			Log.error( error.stack );
		}
		catch( error ) { //looks like it's broken too so let's just do the old school thing
			console.error( error.stack );
		}
	}

	if( exiting.now ) {
		process.exit( 0 ); //exit now
	}

	if( Log.output ) { //if we printed to cli at all
		Log.space();     //adding some space
	}

	process.exit( 0 ); //now exit with a smile :)
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Exporting all
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
module.exports = ( verbose ) => {
	return {
		Log: {
			output: Log.hadOutput,
			error: Log.error,
			info: Log.info,
			ok: Log.ok,
			verbose: ( text ) => Log.verbose( text, verbose ), //we need to pass verbose mode here
			space: Log.space,
		},
		ExitHandler: ExitHandler,
	}
};