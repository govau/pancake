/***************************************************************************************************************************************************************
 *
 * Plug-in for Pancake
 *
 * Move and uglify js files from pancake modules into your pancake folder
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
exports.pancake = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _path = require('path');

var _fs = require('fs');

var _pancake = require('@gov.au/pancake');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * The main pancake method for this plugin
 *
 * @param  {array}  modules - An array of all module objects
 * @param  {object} host    - An object of the host package.json file and it’s path
 *
 * @return {Promise object} - Returns a string with either error in rejection or string with ok message
 */
var pancake = exports.pancake = function pancake(modules, host) {
  if (typeof modules !== 'array') {
    _pancake.Log.error('Plugin pancake-js got a missmath for the data that was passed to it! ' + _pancake.style.yellow('modules') + ' was ' + _pancake.style.yellow(typeof modules === 'undefined' ? 'undefined' : (0, _typeof3.default)(modules)) + ' ' + ('but should have been ' + _pancake.style.yellow('array')));

    _pancake.Log.space();
    process.exit(1);
  }

  if ((typeof host === 'undefined' ? 'undefined' : (0, _typeof3.default)(host)) !== 'object') {
    _pancake.Log.error('Plugin pancake-js got a missmath for the data that was passed to it! ' + _pancake.style.yellow('host') + ' was ' + _pancake.style.yellow(typeof host === 'undefined' ? 'undefined' : (0, _typeof3.default)(host)) + ' ' + ('but should have been ' + _pancake.style.yellow('object')));

    _pancake.Log.space();
    process.exit(1);
  }

  _pancake.Log.info('yayayaya!!!');
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// import { ExitHandler } from "pancake";