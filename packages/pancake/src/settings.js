/***************************************************************************************************************************************************************
 *
 * Get and set global/local settings
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
import Path from 'path';
import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from './logging';
import { WriteFile } from './files';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Finding the right folder in which to run npm prefix
 *
 * @return {string} - The absolute path to the folder of your host package.json
 */
export const Settings = {
	/**
	 * Getting global setting from the settings.json file
	 *
	 * @return {object} - The settings object
	 */
	GetGlobal: () => {
		Log.verbose(`Getting global settings from ${ Style.yellow( Path.normalize(`${ __dirname }/../settings.json`) ) }`);

		let SETTINGS = {};

		try {
			SETTINGS = JSON.parse( Fs.readFileSync( Path.normalize(`${ __dirname }/../settings.json`), `utf8` ) );
		}
		catch( error ) {
			Log.error(`Couldn’t read settings :(`);

			process.exit( 1 );
		}

		Log.verbose( Style.yellow( JSON.stringify( SETTINGS ) ) );

		return SETTINGS;
	},


	/**
	 * Getting local setting from the host package.json file
	 *
	 * @param  {string} cwd - The path to our host package.json
	 *
	 * @return {object}     - The settings object
	 */
	GetLocal: ( cwd ) => {
		Log.verbose(`Getting local settings`);

		let SETTINGS = {};

		try {
			SETTINGS = JSON.parse( Fs.readFileSync( Path.normalize(`${ cwd }/package.json`), `utf8` ) );
		}
		catch( error ) {
			Log.error(`Couldn’t read settings :(`);
			Log.error( error );

			process.exit( 1 );
		}

		if( SETTINGS.pancake === undefined ) {
			SETTINGS.pancake = {};
		}

		//default settings
		let defaultSettings = {
			'auto-save': true,
			plugins: true,
			ignore: [],
		}

		//merging default settings with local package.json
		SETTINGS.pancake = Object.assign( defaultSettings, SETTINGS.pancake );


		Log.verbose( Style.yellow( JSON.stringify( SETTINGS.pancake ) ) );

		return SETTINGS.pancake;
	},


	/**
	 * Writing new global settings to the settings.json file
	 *
	 * @param  {object} SETTINGS - The settings object so we don’t have to read it twice
	 * @param  {array}  items    - The setting to be changed, first item is the name and the following the values
	 *
	 * @return {object}          - The settings object with the new setting
	 */
	SetGlobal: ( SETTINGS, ...items ) => {
		Log.info(`PANCAKE SAVING DEFAULT SETTING`);

		const setting = items[ 0 ];
		const value = items.splice( 1 );

		if( SETTINGS[ setting ] !== undefined ) {
			//setting new value
			if( typeof SETTINGS[ setting ] === 'object' ) {
				SETTINGS[ setting ].push( ...value );
			}

			if( typeof SETTINGS[ setting ] === 'boolean' ) {
				SETTINGS[ setting ] = ( value === "true" );
			}

			if( typeof SETTINGS[ setting ] === 'string' ) {
				SETTINGS[ setting ] = value.toString();
			}

			try {
				Fs.writeFileSync( Path.normalize(`${ __dirname }/../settings.json`), JSON.stringify( SETTINGS, null, '\t' ), 'utf8' );

				Log.ok(`Value for ${ Style.yellow( setting ) } saved`);
			}
			catch( error ) {
				Log.error(`Saving settings failed`);
				Log.error( error );
			}
		}
		else {
			Log.error(`Setting ${ Style.yellow( setting ) } not found`);
		}
	},


	/**
	 * Writing local settings to the package.json file
	 *
	 * @param  {object} SETTINGS - The settings object to be written
	 * @param  {string} pkgPath  - The path to the package.json file
	 *
	 * @return {Promise object}  - The settings object with the new setting
	 */
	SetLocal: ( SETTINGS, pkgPath ) => {
		Log.info(`PANCAKE SAVING LOCAL SETTINGS`);

		return new Promise( ( resolve, reject ) => {

			const PackagePath = Path.normalize(`${ pkgPath }/package.json`);
			let PKGsource;
			let PKG;

			try {
				PKGsource = Fs.readFileSync( PackagePath, `utf8` );
				PKG = JSON.parse( PKGsource );

				Log.verbose(`Read settings at ${ Style.yellow( PackagePath ) }`);
			}
			catch( error ) {
				Log.verbose(`No package.json found at ${ Style.yellow( PackagePath ) }`);
			}

			//only save stuff if we have a package.json file to write to
			if( PKGsource.length > 0 ) {

				//detect indentation
				let _isSpaces;

				let indentation = 2; //default indentation even though you all should be using tabs for indentation!
				try {
					const PKGlines = PKGsource.split('\n');
					_isSpaces = PKGlines[ 1 ].startsWith('  ');
				}
				catch( error ) {
					_isSpaces = true; //buuuhhhhhh 👎
				}

				if( !_isSpaces ) {
					indentation = '\t'; //here we go!
				}

				PKG.pancake = SETTINGS; //set our settings

				WriteFile( PackagePath, JSON.stringify( PKG, null, indentation ) ) //write to package.json
					.catch( error => {
						Log.error( error );

						reject( error );
					})
					.then( written => {
						resolve( SETTINGS );
				});

			}
		});
	},
};
