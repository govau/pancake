/***************************************************************************************************************************************************************
 *
 * Logging made pretty
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
// Verbose flag
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
	value: true
});
var _verbose = false;
if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--verbose') !== -1) {
	_verbose = true;
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Ansi escape color codes
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Returning ansi escape color codes
 * Credit to: https://github.com/chalk/ansi-styles
 *
 * @type {Object}
 */
var Style = exports.Style = {
	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	black: function black(text) {
		return '\x1B[30m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	red: function red(text) {
		return '\x1B[31m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	green: function green(text) {
		return '\x1B[32m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	yellow: function yellow(text) {
		return '\x1B[33m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	blue: function blue(text) {
		return '\x1B[34m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	magenta: function magenta(text) {
		return '\x1B[35m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	cyan: function cyan(text) {
		return '\x1B[36m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	white: function white(text) {
		return '\x1B[37m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	gray: function gray(text) {
		return '\x1B[90m' + text + '\x1B[39m';
	},

	/**
  * Color a string with ansi escape codes
  *
  * @param  {string} text - The string to be wrapped
  *
  * @return {string}      - The string with opening and closing ansi escape color codes
  */
	bold: function bold(text) {
		return '\x1B[1m' + text + '\x1B[22m';
	}
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Logging prettiness
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * A logging object
 *
 * @type {Object}
 */
var Log = exports.Log = {
	output: false, //have we outputted something yet?
	hasError: false, //let’s assume the best

	/**
  * Log an error
  *
  * @param  {string}  text - The text you want to log with the error
  */
	error: function error(text) {
		if (!Log.output) {
			//if we haven’t printed anything yet
			Log.space(); //only then we add an empty line on the top
		}

		if (!Log.hasError) {
			// Loading().stop(); //stop any animations first

			var messages = [//because errors don’t have to be boring!
			'Uh oh', 'Oh no', 'Sorry', 'D\'oh', 'Oh my', 'Ouch', 'Oops', 'Nein', 'Mhh', 'Gosh', 'Gee', 'Goodness', 'Fiddlesticks', 'Dang', 'Dear me', 'Oh dear', 'Phew', 'Pardon', 'Whoops', 'Darn', 'Jinx', 'No luck', 'Cursed', 'Poppycock', 'Humbug', 'Hogwash', 'Boloney', 'Codswallop', 'Nuts', 'Foolery', 'Lunacy', 'Shenanigans', 'Fudge', 'Blimey', 'Dagnabit', 'Bugger'];

			var message = messages.sort(function () {
				return 0.5 - Math.random();
			})[0];

			console.log(Style.red('             ' + '/'.repeat(message.length + 6)));
			console.log(Style.red('            +' + '-'.repeat(message.length + 4) + '+/'));
			console.log(Style.red('            |  ') + Style.bold(Style.red(message)) + Style.red('  |/')); //we need something big to help npms error system
			console.log(Style.red('            +' + '-'.repeat(message.length + 4) + '+') + '\n');
		}

		console.error('\uD83D\uDD25  ' + Style.red('ERROR:   ' + text) + ' ');

		Log.output = true; //now we have written something out
		Log.hasError = true;
	},

	/**
  * Log a message
  *
  * @param  {string}  text - The text you want to log
  */
	info: function info(text) {
		if (!Log.output) {
			Log.space();
		}

		console.info('\uD83D\uDD14  INFO:    ' + text);
		Log.output = true;
	},

	/**
  * Log success
  *
  * @param  {string}  text - The text you want to log
  */
	ok: function ok(text) {
		if (!Log.output) {
			Log.space();
		}

		console.info('\uD83D\uDC4D           ' + Style.green(text));
		Log.output = true;
	},

	/**
  * Log a verbose message
  *
  * @param  {string}  text    - The text you want to log
  * @param  {boolean} verbose - Verbose flag either undefined or true
  */
	verbose: function verbose(text) {
		if (_verbose) {
			if (!Log.output) {
				Log.space();
			}

			console.info('\uD83D\uDE2C  ' + Style.gray('VERBOSE: ' + text));
			Log.output = true;
		}
	},

	/**
  * Add some space to the output
  */
	space: function space() {
		console.log('\n');
	},

	/**
  * Return true if we printed a message already
  *
  * @return {boolean} - Whether or not we’ve outputted something yet
  */
	hadOutput: function hadOutput() {
		return Log.output;
	}
};