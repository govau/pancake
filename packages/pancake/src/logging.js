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
	 * Parse ansi code while making sure we can nest colors
	 *
	 * @param  {string} text  - The text to be enclosed with an ansi escape string
	 * @param  {string} start - The color start code, defaults to the standard color reset code 39m
	 * @param  {string} end   - The color end code
	 *
	 * @return {string}       - The escaped text
	 */
	parse: ( text, start, end = `39m` ) => {
		if( text !== undefined ) {
			const replace = new RegExp( `\\u001b\\[${ end }`, 'g' ); //find any resets so we can nest styles

			return `\u001B[${ start }${ text.toString().replace( replace, `\u001B[${ start }` ) }\u001b[${ end }`;
		}
		else {
			return ``;
		}
	},

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	black: text => Style.parse( text, `30m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	red: text => Style.parse( text, `31m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	green: text => Style.parse( text, `32m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	yellow: text => Style.parse( text, `33m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	blue: text => Style.parse( text, `34m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	magenta: text => Style.parse( text, `35m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	cyan: text => Style.parse( text, `36m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	white: text => Style.parse( text, `37m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	gray: text => Style.parse( text, `90m` ),

	/**
	 * Style a string with ansi escape codes
	 *
	 * @param  {string} text - The string to be wrapped
	 *
	 * @return {string}      - The string with opening and closing ansi escape color codes
	 */
	bold: text => Style.parse( text, `1m`, `22m` ),

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
	verboseMode: true, //verbose flag
	output: false,      //have we outputted something yet?
	hasError: false,    //let’s assume the best

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
				`Pillock`,
				`Fudge`,
				`Crickey`,
			];

			const message = messages.sort( () => 0.5 - Math.random() )[0];

			console.log( Style.red(`                         ${  `/`.repeat( message.length + 6 )  }`) );
			console.log( Style.red(`                        +${ `-`.repeat( message.length + 4 ) }+/`) );
			console.log( Style.red(`            (っ˘̩╭╮˘̩)っ  |  `) + Style.bold( Style.red( message ) ) + Style.red(`  |/`) ); //we need something big to help npms error system
			console.log( Style.red(`                        +${ `-`.repeat( message.length + 4 ) }+`) + `\n` );
		}

		console.error(`🔥  ${ Style.red(`ERROR:   ${ text }`) }`);

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

		Loading.pause();
		console.info(`🔔  INFO:    ${ text }`);
		Loading.resume();

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

		Loading.pause();
		console.info(`👍  ${ Style.green(`OK:`) }      ${ Style.green( text ) }`);
		Loading.resume();

		Log.output = true;
	},

	/**
	 * Log the final message
	 *
	 * @param  {string}  text - The text you want to log
	 */
	done: ( text ) => {
		if( !Log.output ) {
			Log.space();
		}

		Loading.stop();
		console.info(`🚀           ${ Style.green( Style.bold( text ) ) }`);

		Log.output = true;
	},

	/**
	 * Log a verbose message
	 *
	 * @param  {string}  text    - The text you want to log
	 * @param  {boolean} verbose - Verbose flag either undefined or true
	 */
	verbose: ( text ) => {
		if( Log.verboseMode ) {
			if( !Log.output ) {
				Log.space();
			}

			console.info(`😬  ${ Style.gray(`VERBOSE: ${ text }`) }`);
			Log.output = true;
		}
	},

	/**
	 * Add some space to the output
	 */
	space: () => {
		console.log(`\n`);
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
		//pancake loading animation
		Style.gray(`            ( ^-^)${ Style.yellow(`旦`) }                 `),
		Style.gray(`             ( ^-^)${ Style.yellow(`旦`) }                `),
		Style.gray(`              ( ^-^)${ Style.yellow(`旦`) }               `),
		Style.gray(`               ( ^-^)${ Style.yellow(`旦`) }              `),
		Style.gray(`                ( ^-^)${ Style.yellow(`旦`) }             `),
		Style.gray(`                 ( ^-^)${ Style.yellow(`旦`) }            `),
		Style.gray(`                  ( ^-^)${ Style.yellow(`旦`) }           `),
		Style.gray(`                   ( ^-^)${ Style.yellow(`旦`) }          `),
		Style.gray(`                    ( ^-^)${ Style.yellow(`旦`) }         `),
		Style.gray(`                     ( ^-^)${ Style.yellow(`旦`) }        `),
		Style.gray(`                      ( ^-^)${ Style.yellow(`旦`) }       `),
		Style.gray(`                       ( ^-^)${ Style.yellow(`旦`) }      `),
		Style.gray(`                        ( ^-^)${ Style.yellow(`旦`) }     `),
		Style.gray(`                         ( ^-^)${ Style.yellow(`旦`) }    `),
		Style.gray(`                          ( ^-^)${ Style.yellow(`旦`) }   `),
		Style.gray(`                           ( ^-^)${ Style.yellow(`旦`) }  `),
		Style.gray(`                            ( ^-^)${ Style.yellow(`旦`) } `),
		Style.gray(`                            ( ^-^)${ Style.yellow(`旦`) } `),
		Style.gray(`                             ( ^-^)${ Style.yellow(`旦`) }`),
		Style.gray(`                            ${ Style.yellow(`旦`) }(^-^ ) `),
		Style.gray(`                           ${ Style.yellow(`旦`) }(^-^ )  `),
		Style.gray(`                          ${ Style.yellow(`旦`) }(^-^ )   `),
		Style.gray(`                         ${ Style.yellow(`旦`) }(^-^ )    `),
		Style.gray(`                        ${ Style.yellow(`旦`) }(^-^ )     `),
		Style.gray(`                       ${ Style.yellow(`旦`) }(^-^ )      `),
		Style.gray(`                      ${ Style.yellow(`旦`) }(^-^ )       `),
		Style.gray(`                     ${ Style.yellow(`旦`) }(^-^ )        `),
		Style.gray(`                    ${ Style.yellow(`旦`) }(^-^ )         `),
		Style.gray(`                   ${ Style.yellow(`旦`) }(^-^ )          `),
		Style.gray(`                  ${ Style.yellow(`旦`) }(^-^ )           `),
		Style.gray(`                 ${ Style.yellow(`旦`) }(^-^ )            `),
		Style.gray(`                ${ Style.yellow(`旦`) }(^-^ )             `),
		Style.gray(`               ${ Style.yellow(`旦`) }(^-^ )              `),
		Style.gray(`              ${ Style.yellow(`旦`) }(^-^ )               `),
		Style.gray(`             ${ Style.yellow(`旦`) }(^-^ )                `),
		Style.gray(`            ${ Style.yellow(`旦`) }(^-^ )                 `),

		//old style loading animation
		// Style.gray(`            ${ Style.yellow('*') } • • • •`),
		// Style.gray(`            • ${ Style.yellow('*') } • • •`),
		// Style.gray(`            • • ${ Style.yellow('*') } • •`),
		// Style.gray(`            • • • ${ Style.yellow('*') } •`),
		// Style.gray(`            • • • • ${ Style.yellow('*') }`),
		// Style.gray(`            • • • ${ Style.yellow('*') } •`),
		// Style.gray(`            • • ${ Style.yellow('*') } • •`),
		// Style.gray(`            • ${ Style.yellow('*') } • • •`),
		// Style.gray(`            ${ Style.yellow('*') } • • • •`),
	];

	let index = 0;    //the current index of the animation
	let timer = {};   //the setInterval object
	let speed = 80;  //the speed in which to animate

	return {
		running: {},

		start: ( plugin = 'pancake', verbose = Log.verboseMode ) => {
			if( !verbose ) {
				clearInterval( timer ); //stop any possible parallel loaders

				Loading.running[ plugin ] = true;

				process.stdout.write(`${ sequence[ index ] }`); //print the first frame

				timer = setInterval(() => { //animate
					process.stdout.write('\r\x1b[K'); //move cursor to beginning of line and clean line

					index = ( index < sequence.length - 1 ) ? index + 1 : 0;

					process.stdout.write( sequence[ index ] ); //print
				}, speed );
			}
		},

		stop: ( plugin = 'pancake', verbose = Log.verboseMode ) => {
			if( !verbose ) {
				delete Loading.running[ plugin ];

				if( Object.keys( Loading.running ).length === 0 ) {
					clearInterval( timer );             //stop interval
					process.stdout.write('\r\r\x1b[K'); //clear screen
				}
			}
		},

		pause: ( verbose = Log.verboseMode ) => {
			if( !verbose ) {
				clearInterval( timer );             //stop interval
				process.stdout.write('\r\r\x1b[K'); //clear screen
			}
		},

		resume: ( verbose = Log.verboseMode ) => {
			if( !verbose ) {
				if( Object.keys( Loading.running ).length > 0 ) {
					clearInterval( timer ); //stop any possible parallel loaders

					timer = setInterval(() => { //animate
						process.stdout.write('\r\x1b[K'); //move cursor to beginning of line and clean line
						index = ( index < sequence.length - 1 ) ? index + 1 : 0;
						process.stdout.write( sequence[ index ] ); //print
					}, speed );

				}
			}
		},
	};
})();
