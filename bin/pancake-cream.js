#!/usr/bin/env node


/***************************************************************************************************************************************************************
 *
 * CREAM 👀
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

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Spawn = require('child_process');
var StripAnsi = require('strip-ansi');
var Program = require('commander');
var Inquirer = require('inquirer');
var Size = require('window-size');
var Request = require('request');
var Semver = require('semver');
var Chalk = require('chalk');
var Path = require('path');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var pkgPath = Path.normalize(process.cwd() + '/'); //default value of the pkgPath path
var PANCAKEurl = 'https://raw.githubusercontent.com/govau/uikit/master/uikit.json';

Program.usage('[command] <input> <option>').arguments('<pkgPath>').option('-v, --verbose', 'Run the program in verbose mode').option('-j, --json [pancakeURL]', 'Overwrite the default json URL').action(function (pkgPathArgument, pancakeURL) {
	pkgPath = pkgPathArgument; //overwriting default value with user input
	PANCAKEurl = pancakeURL.json ? pancakeURL.json : PANCAKEurl;
}).parse(process.argv);

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var pancakes = require('./pancake-utilities.js')(Program.verbose);
var Log = pancakes.Log;
PANCAKEurl += '?' + Math.floor(new Date().getTime() / 1000); //breaking caching here


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reusable functions
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Get remote json file and return it's data
 *
 * @param  {string} url - The URL of the remote json file
 *
 * @return {object}     - The parsed object of the json content
 */
var GetRemoteJson = function GetRemoteJson(url) {
	return new _promise2.default(function (resolve, reject) {
		Request.get({
			url: url,
			json: true,
			headers: {
				'User-Agent': 'pancake' }
		}, function (error, result, data) {
			if (error) {
				Log.error(error);

				if (error.code === 'ENOTFOUND') {
					reject('Unable to find the json file online. Make sure you\u2019re online.');
				} else {
					reject(error);
				}
			} else if (result.statusCode !== 200) {
				Log.error('Status code of request to ' + Chalk.yellow(url) + ' returned: ' + Chalk.yellow(result.statusCode) + ' ');

				reject(result.statusCode);
			} else {
				resolve(data);
			}
		});
	});
};

/**
 * Highlight with green the changes of an semver version comparison
 *
 * @param  {string} oldVersion - Old version to compare against
 * @param  {string} newVersion - New version to highlight
 *
 * @return {string}            - Highlighted newVersion
 */
var HighlightDiff = function HighlightDiff(oldVersion, newVersion) {
	if (!Semver.valid(oldVersion)) {
		Log.error('Version is not a valid semver version: ' + Chalk.yellow(oldVersion));
	}

	if (!Semver.valid(newVersion)) {
		Log.error('Version is not a valid semver version: ' + Chalk.yellow(newVersion));
	}

	if (Semver.major(oldVersion) !== Semver.major(newVersion)) {
		return Chalk.magenta(newVersion);
	}

	if (Semver.minor(oldVersion) !== Semver.minor(newVersion)) {
		return Semver.major(newVersion) + '.' + Chalk.magenta(Semver.minor(newVersion) + '.' + Semver.patch(newVersion));
	}

	if (Semver.patch(oldVersion) !== Semver.patch(newVersion)) {
		return Semver.major(newVersion) + '.' + Semver.minor(newVersion) + '.' + Chalk.magenta('' + Semver.patch(newVersion));
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
var Headline = function Headline(headline) {
	var subline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	var longestName = arguments[2];

	var sideHeader = (longestName - 4 * 2 - headline.length) / 2; //calculate the sides for the headline for center alignment
	var sideSubline = (longestName + 2 - subline.length) / 2; //calculate the sides for the subline for center alignment

	return [new Inquirer.Separator(' '), new Inquirer.Separator(Chalk.reset.bgBlue.cyan('  \u2550' + '═'.repeat(Math.ceil(sideHeader)) + '\u2561 ' + headline + ' \u255E' + '═'.repeat(Math.floor(sideHeader)) + '\u2550  ')), new Inquirer.Separator('' + (subline.length > 0 ? '' + ' '.repeat(Math.floor(sideSubline)) + Chalk.reset.bold.gray(subline) : ''))];
};

/**
 * Check all dependencies against installed modules and return what breakage might occur and an array of all dependencies
 *
 * @param  {object}  dependencies - All dependencies this module has
 * @param  {map}     installed    - All installed modules to check against
 * @param  {integer} longestName  - The longest name in our output so we can calculate spaces
 *
 * @return {object}               - { breakage: [boolean], lines: [array], breaking: [array] }
 */
var AddDeps = function AddDeps(dependencies, installed, longestName) {
	Log.verbose('Checking dependencies: ' + Chalk.yellow((0, _stringify2.default)(dependencies)) + ' against installed: ' + Chalk.yellow((0, _stringify2.default)([].concat((0, _toConsumableArray3.default)(installed)))));

	var breakage = false; //we always assume the best
	var breaking = []; //in here we collect all modules that will break to display at the end
	var lines = []; //one line per dependency
	var i = 0; //need to see what the last dependency is

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(dependencies)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var module = _step.value;

			i++; //count iterations
			var name = module.substring(pancakes.npmOrg.length + 1, module.length); //removing npm scoping string
			var version = dependencies[module];
			var installedModule = installed.get(module); //looking up if this version exists in our installed modules

			if (installedModule !== undefined && !Semver.satisfies(installedModule, version)) {
				//there is some breakage happening here
				breaking.push(module + '@' + version); //we need this for when we display what we've installed later

				//make it easy to read
				name = Chalk.magenta(name);
				version = Chalk.magenta(version + '   !   ' + installedModule);

				breakage = true; //totally borked
			} else {
				version += '            '; //alignment is everything for readability
			}

			//new lines have to be inside a Separator. Bug launched here: https://github.com/SBoudrias/Inquirer.js/issues/494
			lines.push(new Inquirer.Separator((i >= (0, _keys2.default)(dependencies).length ? '└──' : '├──') + ' ' + (name + ' ') + ('' + ' '.repeat(longestName - StripAnsi(name).length)) + ('' + version) + ('' + (installedModule !== undefined ? '   installed' : ''))));
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return {
		breakage: breakage,
		lines: lines,
		breaking: breaking
	};
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Cream
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info('PANCAKE PUTTING THE CREAM ON TOP');

pancakes.Loading.start(); //start loading animation

var allPromises = []; //collect both promises

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get json file
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.verbose('Getting json file from: ' + Chalk.yellow(PANCAKEurl));

var gettingJSON = GetRemoteJson(PANCAKEurl) //get the json file
.catch(function (error) {
	Log.error(error);

	process.exit(1);
});

var PANCAKE = {}; //for pancake data in a larger scope

gettingJSON.then(function (data) {
	PANCAKE = data; //adding the data of the json file into our scoped variable
});

allPromises.push(gettingJSON); //keep track of all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get pancake modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var allModules = {}; //for all modules in a larger scope

var allPackages = pancakes.GetPackages(pkgPath) //read all packages and return an object per module
.catch(function (error) {
	Log.error(error);

	process.exit(1);
});

allPackages.then(function (data) {
	allModules = data; //adding all pancake modules into our scoped variable
});

allPromises.push(allPackages); //keep track of all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Start compiling what we have vs what we could have
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
_promise2.default.all(allPromises).catch(function (error) {
	pancakes.Loading.stop(); //stop loading animation

	Log.error('An error occurred getting the basics right: ' + error); //I hope that never happens ;)

	process.exit(1);
}).then(function () {
	pancakes.Loading.stop(); //stop loading animation

	var choices = []; //to be filled with all choices we have
	var easyChoices = []; //to be filled with all easy upgradeable non-breaking modules
	var hardChoices = []; //to be filled with all modules with breaking changes
	var installed = new _map2.default(); //to be filled with installed modules

	//convert installed modules array into map for better querying
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = (0, _getIterator3.default)(allModules), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var modulePackage = _step2.value;

			installed.set(modulePackage.name, modulePackage.version);
		}

		//getting the longest name of all pancake modules for nice alignment
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	var longestName = (0, _keys2.default)(PANCAKE).reduce(function (a, b) {
		return a.length > b.length ? a : b;
	}).length - (pancakes.npmOrg.length + 1);

	Log.verbose('Got all data from the json file and installed modules:\n' + ('Installed: ' + Chalk.yellow((0, _stringify2.default)([].concat((0, _toConsumableArray3.default)(installed)))) + '\n') + ('PANCAKE:   ' + Chalk.yellow((0, _stringify2.default)(PANCAKE))));

	//iterate over all pancake modules
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = (0, _getIterator3.default)((0, _keys2.default)(PANCAKE)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var module = _step3.value;

			var thisChoice = {}; //let's build this choice out
			var installedVersion = installed.get(module); //the installed version of this module
			var name = module.substring(pancakes.npmOrg.length + 1, module.length); //removing the scoping string
			var depLines = AddDeps(PANCAKE[module].peerDependencies, installed, longestName); //let's add all the dependencies under each module

			thisChoice.name = ' ' + name + '  ' + ('' + ' '.repeat(longestName - name.length)) + (' ' + PANCAKE[module].version); //we add each module of the json file in here

			thisChoice.value = { //let's make sure we can parse the answer
				name: module,
				version: PANCAKE[module].version,
				dependencies: PANCAKE[module].peerDependencies,
				breaking: [].concat((0, _toConsumableArray3.default)(depLines.breaking))
			};

			//now let's see where to put it?
			if (installedVersion === undefined && !depLines.breakage) {
				//in case we have this module already installed and neither it's dependencies break anything
				easyChoices.push(thisChoice); //so this is a new module
				easyChoices.push.apply(easyChoices, (0, _toConsumableArray3.default)(depLines.lines));
			} else if (!depLines.breakage) {
				//this module is already installed and doesn't break in any of it's dependencies
				if (Semver.gte(PANCAKE[module].version, installedVersion) && //if this version is newer than the installed one
				!Semver.eq(PANCAKE[module].version, installedVersion) //and not equal
				) {
						var newVersion = HighlightDiff(installedVersion, PANCAKE[module].version);

						thisChoice.name = ' ' + name + '  ' + ('' + ' '.repeat(longestName - name.length)) + (' ' + newVersion + '   ^   ' + installedVersion + '   ' + Chalk.gray('installed')); //this is actually an upgrade

						if (Semver.major(installedVersion) !== Semver.major(PANCAKE[module].version)) {

							//adding this module to the modules that will break backwards compatibility
							thisChoice.value.breaking.push(module + '@' + PANCAKE[module].version);

							hardChoices.push(thisChoice); //this is a breaking change upgrade
							hardChoices.push.apply(hardChoices, (0, _toConsumableArray3.default)(depLines.lines));
						} else {
							easyChoices.push(thisChoice); //this is an easy upgrade
							easyChoices.push.apply(easyChoices, (0, _toConsumableArray3.default)(depLines.lines));
						}
					}
			}

			if (depLines.breakage) {
				//some of this modules dependencies breaks backwards compatibility
				hardChoices.push(thisChoice); //so this is a breaking change upgrade
				hardChoices.push.apply(hardChoices, (0, _toConsumableArray3.default)(depLines.lines));
			}
		}

		//find the longest line in all choices
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	var longestLine = [].concat(easyChoices, hardChoices).reduce(function (a, b) {
		var aLine = a.name || a.line;
		var bLine = b.name || b.line;

		return aLine.length > bLine.length ? a : b;
	});

	longestLine = longestLine.name ? StripAnsi(longestLine.name).length : StripAnsi(longestLine.line).length;

	//counting output lines so we only show scrolling if the terminal is not high enough
	var lines = 2;

	//adding headlines and choices
	if (easyChoices.length) {
		choices.push.apply(choices, (0, _toConsumableArray3.default)(Headline('Easy zone', 'Below modules are backwards compatible', longestLine)));
		choices.push.apply(choices, easyChoices); //merging in options

		lines += easyChoices.length + 3; //headline plus choices
	}

	if (hardChoices.length) {
		choices.push.apply(choices, (0, _toConsumableArray3.default)(Headline('Danger zone', 'Below modules come with breaking changes', longestLine)));
		choices.push.apply(choices, hardChoices); //merging in options

		lines += hardChoices.length + 3; //headline plus choices
	}

	Log.space(); //prettiness

	//make sure the viewport is respected
	if (function (lines) {
		return Size.height - 3;
	}) {
		lines = Size.height - 3;
	}

	//render the prompt
	Inquirer.prompt([{
		type: 'checkbox',
		message: 'Select your pancake modules',
		name: 'modules',
		pageSize: lines,
		choices: choices,
		validate: function validate(answer) {
			if (answer.length < 1) {
				return 'You must choose at least one module to install or quit the program.';
			}

			return true;
		}
	}]).then(function (answer) {
		Log.verbose('Got answer:\n' + Chalk.yellow((0, _stringify2.default)(answer.modules)));

		//checking if we got yarn installed
		var command = Spawn.spawnSync('yarn', ['--version']);
		var hasYarn = command.stdout && command.stdout.toString().trim() ? true : false;

		var breaking = void 0;
		var modules = [];

		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = (0, _getIterator3.default)(answer.modules), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				var module = _step4.value;

				modules.push(module.name + '@' + module.version);

				if (module.breaking.length > 0) {
					//collecting all modules with breaking changes
					if (breaking !== undefined) {
						var _breaking;

						(_breaking = breaking).push.apply(_breaking, (0, _toConsumableArray3.default)(module.breaking));
					} else {
						breaking = module.breaking;
					}
				}
			}
		} catch (err) {
			_didIteratorError4 = true;
			_iteratorError4 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion4 && _iterator4.return) {
					_iterator4.return();
				}
			} finally {
				if (_didIteratorError4) {
					throw _iteratorError4;
				}
			}
		}

		Log.space(); //prettiness
		pancakes.Loading.start(); //start loading animation

		var installing = void 0; //for spawning our install process
		// modules = ['beast.js@0.1.4'];

		//installing modules
		if (hasYarn) {
			installing = Spawn.spawn('yarn', ['add'].concat(modules));
		} else {
			installing = Spawn.spawn('npm', ['install'].concat(modules));
		}

		installing.stderr.on('data', function (data) {
			//let's output a way out, a way forward maybe?
			Log.error('An error has occurred while attemptying to install your chosen modules.\n' + 'You can attempt to install those modules yourself by running:\n\n' + Chalk.yellow('yarn add ' + modules.join(' ') + '\n\n') + 'or\n\n' + Chalk.yellow('npm install ' + modules.join(' ')));

			Log.verbose(data);

			pancakes.Loading.stop(); //stop loading animation

			process.exit(1); // :(
		});

		installing.on('close', function (code) {
			Log.verbose('Finished installing modules: ' + Chalk.yellow(modules.join(', ')));

			pancakes.Loading.stop(); //stop loading animation

			Log.info('Modules installed:\n' + Chalk.yellow(modules.join('\n')) + (breaking === undefined ? '' : '\n\nModules and dependencies with breaking changes:\n' + Chalk.yellow(breaking.join('\n'))));
		});
	});
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on('exit', pancakes.ExitHandler.bind(null, { now: false })); //on closing
process.on('SIGINT', pancakes.ExitHandler.bind(null, { now: true })); //on [ctrl] + [c]
process.on('uncaughtException', pancakes.ExitHandler.bind(null, { now: true })); //on uncaught exceptions