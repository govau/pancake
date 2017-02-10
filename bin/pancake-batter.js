#!/usr/bin/env node


/***************************************************************************************************************************************************************
 *
 * BATTER ✅
 *
 * This script will check all modules installed inside the ${ npmOrg } folder and check each peer dependency. Descriptive errors are written out when
 * dependency conflicts are detected.
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

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Spawn = require('child_process').spawnSync;
var Program = require('commander');
var Semver = require('semver');
var Chalk = require('chalk');
var Path = require('path');
var Fs = require('fs');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var pkgPath = Path.normalize(process.cwd() + '/'); //default value of the pkgPath path

Program.usage('[command] <input> <option>').arguments('<pkgPath>').option('-d, --dry', 'Run batter without syrup').option('-v, --verbose', 'Run the program in verbose mode').action(function (pkgPathArgument) {
	pkgPath = pkgPathArgument; //overwriting default value with user input
}).parse(process.argv);

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var pancakes = require('./pancake-utilities.js')(Program.verbose);
var Log = pancakes.Log;

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// PREPARE, Check for dependencies conflicts
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info('PANCAKE MAKING THE BATTER');

pancakes.Loading.start(); //start loading animation

var dependencies = new _map2.default(); //a map we populate with the dependencies of our modules we found
var modules = new _map2.default(); //a map for all installed modules and their versions

var npmVersion = parseInt(Spawn('npm', ['-v']).stdout); //check the npm version
Log.verbose('NPM version ' + Chalk.yellow(npmVersion) + ' detected');

//npm 3 and higher is required as below will install dependencies inside each module folder
if (npmVersion < 3) {
	Log.error('Pancake can only be installed via npm 3 and higher.');
	Log.space();
	process.exit(1);
}

//now we go through all modules and make sure all peerDependencies are satisfied
var allPackages = pancakes.GetPackages(pkgPath) //read all packages and return an object per module
.catch(function (error) {
	Log.error(error);

	process.exit(1);
});

allPackages.catch(function (error) {
	pancakes.Loading.stop(); //stop loading animation

	Log.error('Reading all package.json files bumped into an error: ' + error, verbose);
}).then(function (allModules) {
	//once we got all the content from all package.json files
	pancakes.Loading.stop(); //stop loading animation

	//add all packages into our maps
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)(allModules), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var modulePackage = _step.value;


			modules.set(modulePackage.name, modulePackage.version); //saving all modules with version for later comparison

			if (modulePackage.peerDependencies !== undefined) {
				dependencies.set(modulePackage.name, modulePackage.peerDependencies); //save the dependencies into the map for later comparison
			}
		}

		//iterate over all dependencies [dependencies] and check against what we have installed [modules]
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

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = (0, _getIterator3.default)(dependencies), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
			    module = _step2$value[0],
			    moduleDependencies = _step2$value[1];

			Log.verbose('Checking dependencies for ' + Chalk.yellow(module) + '  which are: ' + Chalk.yellow((0, _stringify2.default)(moduleDependencies)));

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = (0, _getIterator3.default)((0, _keys2.default)(moduleDependencies)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var dependency = _step3.value;

					var version = moduleDependencies[dependency]; //the version we require
					var existing = modules.get(dependency); //the version we have

					if (!Semver.satisfies(existing, version) || existing === undefined) {
						(function () {
							//version conflict or not installed at all?
							var message = existing === undefined ? //building error message
							'the module ' + Chalk.bold(dependency) + ' but it\'s missing.' : Chalk.bold(dependency) + ' version ' + Chalk.bold(version) + ', however version ' + Chalk.bold(existing) + ' was installed.';

							Log.error('Found conflicting dependenc(ies)');
							Log.error('The module ' + Chalk.bold(module) + ' requires ' + message);

							//let's look who else depends on this conflicting module
							var otherModules = {};
							var _iteratorNormalCompletion4 = true;
							var _didIteratorError4 = false;
							var _iteratorError4 = undefined;

							try {
								for (var _iterator4 = (0, _getIterator3.default)(dependencies), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
									var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2),
									    subModule = _step4$value[0],
									    subModuleDependencies = _step4$value[1];

									if (subModuleDependencies[dependency] !== undefined) {
										if (otherModules[subModuleDependencies[dependency]] === undefined) {
											otherModules[subModuleDependencies[dependency]] = [];
										}

										otherModules[subModuleDependencies[dependency]].push(subModule); //sort by version
									}
								}

								//sort versions
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

							var otherModulesOrdered = {};
							(0, _keys2.default)(otherModules).sort().forEach(function (key) {
								otherModulesOrdered[key] = otherModules[key];
							});

							//generate tree
							message = '\n\n' + Chalk.bold(dependency) + ' is required by the following modules:';

							var _iteratorNormalCompletion5 = true;
							var _didIteratorError5 = false;
							var _iteratorError5 = undefined;

							try {
								for (var _iterator5 = (0, _getIterator3.default)((0, _keys2.default)(otherModulesOrdered)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
									var key = _step5.value;

									message += Chalk.bold('\n\n. ' + key);

									for (var i = 0; i < otherModulesOrdered[key].length; i++) {
										message += '\n' + (i + 1 == otherModulesOrdered[key].length ? '└' : '├') + '\u2500\u2500 ' + otherModulesOrdered[key][i];
									};
								}
							} catch (err) {
								_didIteratorError5 = true;
								_iteratorError5 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion5 && _iterator5.return) {
										_iterator5.return();
									}
								} finally {
									if (_didIteratorError5) {
										throw _iteratorError5;
									}
								}
							}

							console.log(Chalk.red(message + '\n')); //print tree

							Log.error('To fix this issue make sure all your modules require the same version.');

							//suggestion...
							if ((0, _keys2.default)(otherModules).length == 1) {
								Log.error('Maybe upgrade the ' + Chalk.bold(dependency) + ' module.');
							}

							process.exit(1); //error out so npm knows things went wrong
						})();
					}
				}
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
		}
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

	if (allModules.length > 0) {
		Log.ok('All modules(' + allModules.length + ') without conflict \uD83D\uDCA5');

		if (!Program.dry) {
			//Shooting off to syrup
			Log.verbose('Running syrup with: ' + Chalk.yellow('pancake syrup ' + pkgPath + ' ' + (Program.verbose ? '-v' : '') + ' --batter'));

			Spawn('pancake', ['syrup', pkgPath, Program.verbose ? '-v' : '', '--batter'], { shell: true, stdio: 'inherit' });
		}
	} else {
		Log.info('No modules found \uD83D\uDE2C');
	}
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on('exit', pancakes.ExitHandler.bind(null, { now: false })); //on closing
process.on('SIGINT', pancakes.ExitHandler.bind(null, { now: true })); //on [ctrl] + [c]
process.on('uncaughtException', pancakes.ExitHandler.bind(null, { now: true })); //on uncaught exceptions