/***************************************************************************************************************************************************************
 *
 * Parse the arguments of the cli
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
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from './logging';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Parsing arguments coming form the cli
 *
 * @param  {object} SETTINGS - The global settings object
 * @param  {array}  args     - The arguments passed to the program, defaults to process.argv
 *
 * @return {object}          - The defaults merged with the parsed arguments
 */
export const ParseArgs = ( SETTINGS, args = process.argv ) => {
	Log.verbose(`Cli arguments: ${ Style.yellow( args.slice( 2 ).join(', ') ) }`);

	const allowed = {     //all allowed commands
		'--version': {      //the long version of the argument
			name: 'version',  //the name of the argument to map to it’s defaults
			short: '-V',      //the shortcut of this argument
			options: 0,       //how many options may be passed to it
		},
		'--verbose': {
			name: 'verbose',
			short: '-v',
			options: 0,
		},
		'--set': {
			name: 'set',
			short: '-s',
			options: 2,
		},
		'--json': {
			name: 'json',
			short: '-j',
			options: 1,
		},
		'--noplugins': {
			name: 'plugins',
			short: '-p',
			options: 0,
		},
		'--ignore': {
			name: 'ignorePlugins',
			short: '-i',
			options: 1,
		},
		'--help': {
			name: 'help',
			short: '-h',
			options: 0,
		},
	};

	const defaults = { //we need to return these
		cwd: undefined,
		version: false,
		verbose: false,
		set: [],
		json: SETTINGS.creamJson,
		plugins: true,
		ignorePlugins: [],
		help: false,
	};

	let index = 2; //the first two arguments are always the path to node and the path to this app

	if( args.length > 2 ) { //if there are even any arguments passed

		//optional argument in first place for cwd overwrite
		if( !args[ 2 ].startsWith(`-`) ) {
			defaults.cwd = args[ 2 ];

			index = 3; //move right along
		}

		//now parse each argument
		for( index; index < args.length; index++ ) {
			let arg = args[ index ];

			//maybe we are using the shortcut?
			if( allowed[ arg ] === undefined ) {
				for( const key of Object.keys( allowed ) ) {
					if( allowed[ key ].short === arg ) {
						arg = key; //use long version from here on out
						break;
					}
				};
			}

			//have we found this argument now?
			if( allowed[ arg ] === undefined ) {
				Log.error(`There is no such option as ${ Style.yellow( arg ) }`);
				Log.error(`The available options are:\n            ${ Style.yellow( Object.keys( allowed ).join(`, `) ) }`);
			}
			else { //argument found
				const command = allowed[ arg ];

				if( command.options > 0 ) { //flag with options
					for( let i = 0; i < command.options; i++ ) { //iterating over the options by moving along in the process.argv array
						index ++;

						if( args[ index ] === undefined ) {
							Log.error(`There are some missings options in the commande ${ Style.yellow( arg ) }`);
						}
						else {
							if( typeof defaults[ command.name ] === 'object' ) { //the defaults make this as an object/array
								if( args[ index ].includes(',') ) { //the passing argument includes a comma so we split it
									defaults[ command.name ].push( ...args[ index ].split(',') ); //adding to defaults
								}
								else {
									defaults[ command.name ].push( args[ index ] ); //adding to defaults
								}
							}

							if( typeof defaults[ command.name ] === 'string' ) { //the defaults mark this as a string
								defaults[ command.name ] = args[ index ]; //set in defaults
							}
						}
					}
				}
				else { //boolean flag without options
					defaults[ command.name ] = !defaults[ command.name ]; //invert the default
				}
			}
		}

	}

	Log.verbose(`Parsed arguments:\n${ Style.yellow( JSON.stringify( defaults ) ) }`);

	return defaults;
};
