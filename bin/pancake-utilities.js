#!/usr/bin/env node


/***************************************************************************************************************************************************************
 *
 * Pancake utilities
 *
 **************************************************************************************************************************************************************/

'use strict';

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CFonts = require('cfonts');
var Chalk = require('chalk');
var Path = require('path');
var Fs = require('fs');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Variables
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * npm organization for scoped packages, this is what we are looking into when searching for dependency issues
 *
 * @type constant {String}
 */
var npmOrg = '@gov.au';

/**
 * This keyword will signal to us that the package we found is a legitimate pancake module
 *
 * @type constant {String}
 */
var controlKeyword = 'pancake-module';

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Objects / functions
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Create a path if it doesn't exist
 *
 * @param  {string}  dir      - The path to be checked and created if not found
 * @param  {boolean} verbose  - Verbose flag either undefined or true
 */
var _CreateDir = function _CreateDir(dir, verbose) {
	Log.verbose('Creating path ' + Chalk.yellow(dir), verbose);

	var splitPath = dir.split('/');

	splitPath.reduce(function (path, subPath) {
		var currentPath = void 0;

		if (subPath != '.') {
			currentPath = path + '/' + subPath;

			if (!Fs.existsSync(currentPath)) {
				try {
					Fs.mkdirSync(currentPath);
				} catch (error) {
					Log.error(error);

					process.exit(1);
				}
			}
		} else {
			currentPath = subPath;
		}

		return currentPath;
	}, '');
};

/**
 * Get all folders within a given path
 *
 * @param  {string}  thisPath - The path that contains the desired folders
 * @param  {boolean} verbose  - Verbose flag either undefined or true
 *
 * @return {array}            - An array of paths to each folder
 */
var _GetFolders = function _GetFolders(thisPath, verbose) {
	Log.verbose('Running GetFolders on ' + Chalk.yellow(thisPath), verbose);

	try {
		return Fs.readdirSync(thisPath) //read the folders content
		.filter(function (thisFile) {
			return Fs.statSync(thisPath + '/' + thisFile).isDirectory();
		} //only return directories
		).map(function (path) {
			return Path.normalize(thisPath + '/' + path);
		}); //return with path
	} catch (error) {
		Log.verbose(Chalk.yellow(thisPath) + ' not found', verbose);

		return [];
	}
};

/**
 * Reading a package.json file
 *
 * @param  {string}  pkgPath - The path to the folder the package.json is in (omitting package.json)
 * @param  {boolean} verbose - Verbose flag either undefined or true
 *
 * @return {promise object}  - Returns a promise and some of the data of the package.json
 */
var ReadPackage = function ReadPackage(pkgPath, verbose) {
	var thisPath = Path.normalize(pkgPath + '/package.json');

	Log.verbose('Reading ' + Chalk.yellow(thisPath), verbose);

	return new _promise2.default(function (resolve, reject) {
		Fs.readFile(thisPath, 'utf8', function (error, data) {
			if (error) {
				Log.verbose('No package.json found in ' + Chalk.yellow(thisPath), verbose); //folders like .bin and .staging won't have package.json inside

				resolve(null);
			} else {

				var packageJson = JSON.parse(data); //parse the package.json

				if (packageJson.keywords.indexOf(controlKeyword) !== -1) {
					//is this a pancake module?
					Log.verbose(Chalk.green('✔') + ' Identified ' + Chalk.yellow(packageJson.name) + ' as pancake module', verbose);

					//we only want a subset
					var miniPackage = {
						name: packageJson.name,
						version: packageJson.version,
						peerDependencies: packageJson.peerDependencies,
						path: pkgPath
					};

					// setTimeout(() => { resolve( miniPackage ); }, 3000); //for testing animation
					resolve(miniPackage);
				} else {
					resolve(null); //non-pancake packages get null so we can identify them later and filter them out
				}
			}
		});
	});
};

/**
 * Get an object of all pancake modules package.json inside a specified folder
 *
 * @param  {string}  pkgPath - The path that includes your node_module folder
 * @param  {boolean} verbose - Verbose flag either undefined or true
 *
 * @return {promise object}  - A promise.all that resolves when all package.jsons have been read
 */
var _GetPackages = function _GetPackages(pkgPath, verbose) {
	if (typeof pkgPath !== 'string' || pkgPath.length <= 0) {
		Log.error('GetPackages only takes a valid path. You passed [type: ' + Chalk.yellow(typeof pkgPath === 'undefined' ? 'undefined' : (0, _typeof3.default)(pkgPath)) + '] "' + Chalk.yellow(pkgPath) + '"', verbose);
	}

	pkgPath = Path.normalize(pkgPath + '/node_modules/' + npmOrg + '/'); //we add our npm org to the path

	Log.verbose('Looking for pancake modules in: ' + Chalk.yellow(pkgPath), verbose);

	var allModules = _GetFolders(pkgPath); //all folders inside the selected path

	if (allModules !== undefined && allModules.length > 0) {
		Log.verbose('Found the following module folders:\n' + Chalk.yellow(allModules.join('\n')), verbose);

		var allPackages = allModules.map(function (pkg) {
			return ReadPackage(pkg, verbose).catch(function (error) {
				Log.error(error);

				process.exit(1);
			});
		}); //read all packages and save the promise return

		return _promise2.default.all(allPackages).then(function (packages) {
			//chaining the promise
			return packages.filter(function (p) {
				return p !== null;
			}); //making sure packages not identified as a pancake module don't leave a trace in the returned array
		});
	} else {
		return _promise2.default.resolve([]); //no pancake modules found at all
	}
};

/**
 * Loading animation
 *
 * @method  start - Start spinner
 * @method  stop  - Stop spinner
 *
 * @return {object} - Object with methods
 */
var Loading = function Loading(verbose) {

	//settings
	var sequence = [//the sequence of all animation frame
	Chalk.gray('            ' + Chalk.yellow('*') + ' \u2022 \u2022 \u2022 \u2022'), Chalk.gray('            \u2022 ' + Chalk.yellow('*') + ' \u2022 \u2022 \u2022'), Chalk.gray('            \u2022 \u2022 ' + Chalk.yellow('*') + ' \u2022 \u2022'), Chalk.gray('            \u2022 \u2022 \u2022 ' + Chalk.yellow('*') + ' \u2022'), Chalk.gray('            \u2022 \u2022 \u2022 \u2022 ' + Chalk.yellow('*')), Chalk.gray('            \u2022 \u2022 \u2022 ' + Chalk.yellow('*') + ' \u2022'), Chalk.gray('            \u2022 \u2022 ' + Chalk.yellow('*') + ' \u2022 \u2022'), Chalk.gray('            \u2022 ' + Chalk.yellow('*') + ' \u2022 \u2022 \u2022'), Chalk.gray('            ' + Chalk.yellow('*') + ' \u2022 \u2022 \u2022 \u2022')];
	var index = 0; //the current index of the animation
	var timer = {}; //the setInterval object
	var speed = 80; //the speed in which to animate

	return {
		start: function start() {
			if (!verbose) {
				clearInterval(timer); //stop any possible parallel loaders

				process.stdout.write('' + sequence[index]); //print the first frame

				timer = setInterval(function () {
					//animate
					process.stdout.write('\r\x1b[K'); //move cursor to beginning of line and clean line

					index = index < sequence.length - 1 ? index + 1 : 0;

					process.stdout.write(sequence[index]); //print
				}, speed);
			}
		},

		stop: function stop() {
			if (!verbose) {
				clearInterval(timer); //stop interval

				process.stdout.write('\r\r\x1b[K'); //clear screen
			}
		}
	};
};

/**
 * Debugging prettiness
 *
 * @type {Object}
 */
var Log = {
	output: false, //have we outputted something yet?
	hasError: false, //let's assume the best

	/**
  * Log an error
  *
  * @param  {string}  text - The text you want to log with the error
  */
	error: function error(text) {
		if (!Log.output) {
			//if we haven't printed anything yet
			Log.space(); //only then we add an empty line on the top
		}

		if (!Log.hasError) {
			Loading().stop(); //stop any animations first

			var messages = [//because errors don't have to be boring!
			'Uh oh', 'Sorry', 'Doh', 'Oh my', 'Ouch', 'Ups'];

			CFonts.say(messages.sort(function () {
				return 0.5 - Math.random();
			})[0], { //we need something big to help npms error system
				colors: ['red', 'red'],
				space: false
			});
			console.log();
		}

		console.error('\uD83D\uDD25  ' + Chalk.red('ERROR:   ' + text) + ' ');

		Log.output = true; //now we have written something out
		Log.hasError = true;
	},

	/**
  * Log a message
  *
  * @param  {string}  text - The text you want to log
  */
	info: function info(text) {
		if (!Log.output) {
			Log.space();
		}

		console.info('\uD83D\uDD14  INFO:    ' + text);
		Log.output = true;
	},

	/**
  * Log success
  *
  * @param  {string}  text - The text you want to log
  */
	ok: function ok(text) {
		if (!Log.output) {
			Log.space();
		}

		console.info('\uD83D\uDC4D           ' + Chalk.green(text));
		Log.output = true;
	},

	/**
  * Log a verbose message
  *
  * @param  {string}  text    - The text you want to log
  * @param  {boolean} verbose - Verbose flag either undefined or true
  */
	verbose: function verbose(text, _verbose) {
		if (_verbose) {
			if (!Log.output) {
				Log.space();
			}

			console.info('\uD83D\uDE2C  ' + Chalk.gray('VERBOSE: ' + text));
			Log.output = true;
		}
	},

	/**
  * Add some space to the output
  */
	space: function space() {
		console.log('\n');
	},

	/**
  * Return true if we printed a message already
  *
  * @return {boolean} - Whether or not we've outputted something yet
  */
	hadOutput: function hadOutput() {
		return Log.output;
	}
};

/**
 * Handle exiting of program
 *
 * @param {null}   exiting - null for bind
 * @param {object} error   - Object to distinguish between closing events
 */
function ExitHandler(exiting, error) {
	if (error && error !== 1) {
		try {
			//try using our pretty output
			Log.error(error);
		} catch (error) {
			//looks like it's broken too so let's just do the old school thing
			console.error(error);
		}
	}

	if (exiting.now) {
		process.exit(0); //exit now
	}

	if (Log.output) {
		//if we printed to cli at all
		Log.space(); //adding some space
	}

	process.exit(0); //now exit with a smile :)
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Exporting all the things
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
module.exports = function (_verbose2) {
	return {
		Log: {
			output: Log.hadOutput,
			error: Log.error,
			info: Log.info,
			ok: Log.ok,
			verbose: function verbose(text) {
				return Log.verbose(text, _verbose2);
			}, //we need to pass verbose mode here
			space: Log.space
		},
		ExitHandler: ExitHandler,
		Loading: Loading(_verbose2),
		CreateDir: function CreateDir(thisPath) {
			return _CreateDir(thisPath, _verbose2);
		}, //we need to pass verbose mode here
		GetFolders: function GetFolders(thisPath) {
			return _GetFolders(thisPath, _verbose2);
		}, //we need to pass verbose mode here
		GetPackages: function GetPackages(thisPath) {
			return _GetPackages(thisPath, _verbose2);
		}, //we need to pass verbose mode here
		npmOrg: npmOrg,
		controlKeyword: controlKeyword
	};
};