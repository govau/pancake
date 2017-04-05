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
import StripAnsi from 'strip-ansi';
import inquirer from 'inquirer';
import Path from 'path';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Using this file to export the reusable items
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { HighlightDiff, Headline } from './prettiness.js';
import { AddDeps } from './dependencies.js';
import { GetRemoteJson } from './json.js';


export { //here, take a sword; for you may need it
	HighlightDiff,
	Headline,
	AddDeps,
	GetRemoteJson,
};
