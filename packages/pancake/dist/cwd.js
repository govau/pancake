/***************************************************************************************************************************************************************
 *
 * Find the current working directory by checking inside the current directory for a package.json and see if it is a pancake module.
 * If it is then we go to the parent folder and run `npm prefix` there. Otherwise run `npm prefix` in the current working directory.
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

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Cwd = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _helpers = require('./helpers');

var _logging = require('./logging');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Finding the right folder in which to run npm prefix
 *
 * @return {string} - The absolute path to the folder of your host package.json
 */

// import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var Cwd = exports.Cwd = function Cwd() {
	_logging.Log.verbose('Looking for cwd');

	var rootPath = void 0;

	//let’s find the package.json and check if it's a valid one
	try {
		var _pkgPath = _path2.default.normalize(process.cwd() + '/package.json'); //on this level

		var testingPkg = require(_pkgPath);

		if (testingPkg.pancake !== undefined) {
			//this package.json has an pancake object
			_logging.Log.verbose('Found valid pancake-module packages in ' + _logging.Style.yellow(process.cwd()));

			rootPath = _path2.default.normalize(process.cwd() + '/../'); //so let’s go down one level and look for the next package.json file
		} else {
			//not a valid pancake module
			_logging.Log.verbose('Found package.json in ' + _logging.Style.yellow(_pkgPath));

			rootPath = _path2.default.normalize(process.cwd() + '/'); //we start looking from here on for the next package.json
		}
	} catch (error) {
		//no package.json found in this folder
		_logging.Log.verbose('No package.json found in ' + _logging.Style.yellow(process.cwd()));

		rootPath = _path2.default.normalize(process.cwd() + '/'); //we start looking from here on for the next package.json
	}

	var pkgPath = _helpers.Spawning.sync('npm', ['prefix'], { cwd: rootPath }).stdout.toString().replace('\n', ''); //this will find the nearest package.json
	_logging.Log.verbose('Found cwd in ' + _logging.Style.yellow(pkgPath));

	return pkgPath;
};