/***************************************************************************************************************************************************************
 *
 * Adding some prettiness to our syrup
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
import Inquirer from 'inquirer';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Exports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style, Semver } from '@gov.au/pancake';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check npm version
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Highlight with green the changes of an semver version comparison
 *
 * @param  {string} oldVersion - Old version to compare against
 * @param  {string} newVersion - New version to highlight
 *
 * @return {string}            - Highlighted newVersion
 */
export const HighlightDiff = ( oldVersion, newVersion ) => {
	if( !Semver.valid( oldVersion ) ) {
		Log.error(`Version is not a valid semver version: ${ Style.yellow( oldVersion ) }`);
	}

	if( !Semver.valid( newVersion ) ) {
		Log.error(`Version is not a valid semver version: ${ Style.yellow( newVersion ) }`);
	}

	if( Semver.major( oldVersion ) !== Semver.major( newVersion ) ) {
		return Style.magenta( newVersion );
	}

	if( Semver.minor( oldVersion ) !== Semver.minor( newVersion ) ) {
		return `${ Semver.major( newVersion ) }.${ Style.magenta(`${ Semver.minor( newVersion ) }.${ Semver.patch( newVersion ) }`)}`;
	}

	if( Semver.patch( oldVersion ) !== Semver.patch( newVersion ) ) {
		return `${ Semver.major( newVersion ) }.${ Semver.minor( newVersion ) }.${ Style.magenta(`${ Semver.patch( newVersion ) }`)}`;
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
export const Headline = ( headline, subline = '', longestName ) => {
	let sideHeader = ( longestName - ( 4 * 2 ) - headline.length ) / 2; //calculate the sides for the headline for center alignment
	let sideSubline = ( longestName + 2 - subline.length ) / 2;         //calculate the sides for the subline for center alignment

	if( sideHeader < 0 ) { //getting edgy
		sideHeader = 0;
	}

	if( sideSubline < 0 ) { //getting edgy
		sideSubline = 0;
	}

	return [
		new Inquirer.Separator(` `),
		new Inquirer.Separator(
			`\u001b[0m\u001b[44m\u001b[1m\u001b[36m` +
			`  ═${ '═'.repeat( Math.ceil( sideHeader ) ) }╡ ${ headline } ╞${ '═'.repeat( Math.floor( sideHeader ) ) }═  ` +
			`\u001b[39m\u001b[22m\u001b[49m\u001b[0m`
		),
		new Inquirer.Separator(
			`${ subline.length > 0 ? `${ ' '.repeat( Math.floor( sideSubline ) ) }\u001b[0m${ Style.cyan( subline ) }\u001b[0m` : `` }`
		),
	];
};
