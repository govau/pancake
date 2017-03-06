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
let verbose = false;
if( process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--verbose') !== -1 ) {
	verbose = true;
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
export const Style = {
	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	black: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[30m${ text.toString().replace( /\u001b\[39m/g, '\u001B[30m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	red: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[31m${ text.toString().replace( /\u001b\[39m/g, '\u001B[31m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	green: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[32m${ text.toString().replace( /\u001b\[39m/g, '\u001B[32m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	yellow: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[33m${ text.toString().replace( /\u001b\[39m/g, '\u001B[33m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	blue: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[34m${ text.toString().replace( /\u001b\[39m/g, '\u001B[34m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	magenta: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[35m${ text.toString().replace( /\u001b\[39m/g, '\u001B[35m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	cyan: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[36m${ text.toString().replace( /\u001b\[39m/g, '\u001B[36m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	white: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[37m${ text.toString().replace( /\u001b\[39m/g, '\u001B[37m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	gray: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[90m${ text.toString().replace( /\u001b\[39m/g, '\u001B[90m' ) }\u001b[39m`;
		}
		else {
			return '';
		}
	},

	/**
	 * Color a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	bold: ( text ) => {
		if( text !== undefined ) {
			return `\u001B[1m${ text }\u001b[22m`;
		}
		else {
			return '';
		}
	},
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Logging prettiness
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * A logging object
 *
 * @type {Object}
 */
export const Log = {
	output: false,   //have we outputted something yet?
	hasError: false, //let’s assume the best

	/**
	 * Log an error
	 *
	 * @param  {string}  text - The text you want to log with the error
	 */
	error: ( text ) => {
		if( !Log.output ) { //if we haven’t printed anything yet
			Log.space();      //only then we add an empty line on the top
		}

		Loading.stop(); //stop any animations first

		if( !Log.hasError ) {
			const messages = [ //because errors don’t have to be boring!
				`Uh oh`,
				`Oh no`,
				`Sorry`,
				`D'oh`,
				`Oh my`,
				`Ouch`,
				`Oops`,
				`Nein`,
				`Mhh`,
				`Gosh`,
				`Gee`,
				`Goodness`,
				`Fiddlesticks`,
				`Dang`,
				`Dear me`,
				`Oh dear`,
				`Phew`,
				`Pardon`,
				`Whoops`,
				`Darn`,
				`Jinx`,
				`No luck`,
				`Cursed`,
				`Poppycock`,
				`Humbug`,
				`Hogwash`,
				`Boloney`,
				`Codswallop`,
				`Nuts`,
				`Foolery`,
				`Lunacy`,
				`Shenanigans`,
				`Fudge`,
				`Blimey`,
				`Dagnabit`,
				`Bugger`,
			];

			const message = messages.sort( () => 0.5 - Math.random() )[0];

			console.log( Style.red(`             ${  `/`.repeat( message.length + 6 )  }`) );
			console.log( Style.red(`            +${ `-`.repeat( message.length + 4 ) }+/`) );
			console.log( Style.red(`            |  `) + Style.bold( Style.red( message ) ) + Style.red(`  |/`) ); //we need something big to help npms error system
			console.log( Style.red(`            +${ `-`.repeat( message.length + 4 ) }+`) + `\n` );
		}

		console.error(`🔥  ${ Style.red( `ERROR:   ${ text }` ) } `);

		Log.output = true; //now we have written something out
		Log.hasError = true;
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

		Loading.stop();
		console.info(`🔔  INFO:    ${ text }`);
		Loading.start();

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

		Loading.stop();
		console.info(`👍           ${ Style.green( text ) }`);
		Loading.start();

		Log.output = true;
	},

	/**
	 * Log a verbose message
	 *
	 * @param  {string}  text    - The text you want to log
	 * @param  {boolean} verbose - Verbose flag either undefined or true
	 */
	verbose: ( text ) => {
		if( verbose ) {
			if( !Log.output ) {
				Log.space();
			}

			console.info(`😬  ${ Style.gray( `VERBOSE: ${ text }` ) }`);
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
	 * @return {boolean} - Whether or not we’ve outputted something yet
	 */
	hadOutput: () => {
		return Log.output;
	},
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Ansi loading animation
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Loading animation
 *
 * @method  start - Start spinner
 * @method  stop  - Stop spinner
 *
 * @return {object} - Object with methods
 */
export const Loading = (() => {

	const sequence = [ //the sequence of all animation frame
		Style.gray(`            ${ Style.yellow('*') } • • • •`),
		Style.gray(`            • ${ Style.yellow('*') } • • •`),
		Style.gray(`            • • ${ Style.yellow('*') } • •`),
		Style.gray(`            • • • ${ Style.yellow('*') } •`),
		Style.gray(`            • • • • ${ Style.yellow('*') }`),
		Style.gray(`            • • • ${ Style.yellow('*') } •`),
		Style.gray(`            • • ${ Style.yellow('*') } • •`),
		Style.gray(`            • ${ Style.yellow('*') } • • •`),
		Style.gray(`            ${ Style.yellow('*') } • • • •`),
	];

	let index = 0;   //the current index of the animation
	let timer = {};  //the setInterval object
	let speed = 80;  //the speed in which to animate

	return {
		start: () => {
			if( !verbose ) {
				clearInterval( timer ); //stop any possible parallel loaders

				process.stdout.write(`${ sequence[ index ] }`); //print the first frame

				timer = setInterval(() => { //animate
					process.stdout.write('\r\x1b[K'); //move cursor to beginning of line and clean line

					index = ( index < sequence.length - 1 ) ? index + 1 : 0;

					process.stdout.write( sequence[ index ] ); //print
				}, speed );
			}
		},

		stop: () => {
			if( !verbose ) {
				clearInterval( timer ); //stop interval

				process.stdout.write('\r\r\x1b[K'); //clear screen
			}
		},
	};
})();
