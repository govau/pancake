/***************************************************************************************************************************************************************
 *
 * Returning ansi escape color codes
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
exports.ExitHandler = exports.Spawning = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _logging = require('./logging');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Spawning new processes cross os
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Spawning child processes in an abstraction so we can handle different OS
 *
 * @type {Object}
 */
var Spawning = exports.Spawning = {
	isWin: /^win/.test(process.platform), //sniffing the os, Can’t use os.platform() as we want to support node 5

	/**
  * Spawning async
  *
  * @param  {string}  command - The program we run
  * @param  {array}   options - the flags and options we pass to it
  * @param  {object}  param   - Parameters we pass to child_process
  *
  * @return {Promise object}  - The object returned from child_process.spawn
  */
	async: function async(command, options) {
		var param = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		_logging.Log.verbose('Spawning async ' + _logging.Style.yellow(command + ' ' + [].concat((0, _toConsumableArray3.default)(options)).join(' ') + ' ') + ' with ' + _logging.Style.yellow((0, _stringify2.default)(param)));

		if (Spawning.isWin) {
			return _child_process2.default.spawn('cmd.exe', ['/s', '/c', command].concat((0, _toConsumableArray3.default)(options)), param);
		} else {
			return _child_process2.default.spawn(command, [].concat((0, _toConsumableArray3.default)(options)), param);
		}
	},

	/**
  * Spawning sync
  *
  * @param  {string}  command - The program we run
  * @param  {array}   options - the flags and options we pass to it
  * @param  {object}  param   - Parameters we pass to child_process
  *
  * @return {Promise object}  - The object returned from child_process.spawnSync
  */
	sync: function sync(command, options) {
		var param = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


		_logging.Log.verbose('Spawning sync ' + _logging.Style.yellow(command + ' ' + [].concat((0, _toConsumableArray3.default)(options)).join(' ')) + ' with ' + _logging.Style.yellow((0, _stringify2.default)(param)));

		if (Spawning.isWin) {
			return _child_process2.default.spawnSync('cmd.exe', ['/s', '/c', command].concat((0, _toConsumableArray3.default)(options)), param);
		} else {
			return _child_process2.default.spawnSync(command, [].concat((0, _toConsumableArray3.default)(options)), param);
		}
	}
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Exit handler
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Handle exiting of program
 *
 * @param {null}   exiting - null for bind
 * @param {object} error   - Object to distinguish between closing events
 */

// import Path from 'path';
// import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var ExitHandler = exports.ExitHandler = function ExitHandler(exiting, error) {
	if (error && error !== 1) {
		try {
			//try using our pretty output
			_logging.Log.error(error);
		} catch (error) {
			//looks like it's broken too so let's just do the old school thing
			console.error(error);
		}
	}

	if (exiting.now) {
		process.exit(0); //exit now
	}

	if (_logging.Log.output) {
		//if we printed to cli at all
		_logging.Log.space(); //adding some space
	}

	process.exit(0); //now exit with a smile :)
};