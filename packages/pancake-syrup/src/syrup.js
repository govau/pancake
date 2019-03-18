#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * SYRUP
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
const StripAnsi = require( 'strip-ansi' );
const inquirer = require( 'inquirer' );
const Path = require( 'path' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Using this file to export the reusable items
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const { HighlightDiff, Headline } = require('./prettiness.js' );
const { AddDeps } = require('./dependencies.js' );
const { GetRemoteJson } = require( './json.js' );


module.exports = { //here, take a sword; for you may need it
	HighlightDiff,
	Headline,
	AddDeps,
	GetRemoteJson,
};
