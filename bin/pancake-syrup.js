#!/usr/bin/env node


/***************************************************************************************************************************************************************
 *
 * SYRUP 🍯
 *
 * This script will compile your assets and save them in a folder outside node_modules/. This behavior can be changed in your own package.json.
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

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Autoprefixer = require('autoprefixer');
var UglifyJS = require("uglify-js");
var Program = require('commander');
var Postcss = require('postcss');
var Sass = require('node-sass');
var Chalk = require('chalk');
var Path = require('path');
var Fs = require('fs');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var pkgPath = Path.normalize(process.cwd() + '/'); //default value of the pkgPath path

Program.usage('[command] <input> <option>').arguments('<pkgPath>').option('-s, --save', 'Save my compile settings into my package.json').option('-b, --batter', 'Running syrup directly from batter').option('-v, --verbose', 'Run the program in verbose mode').action(function (pkgPathArgument) {
	pkgPath = pkgPathArgument; //overwriting default value with user input
}).parse(process.argv);

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Globals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var pancakes = require('./pancake-utilities.js')(Program.verbose);
var Log = pancakes.Log;

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reusable functions
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Promisified writing a file
 *
 * @param  {string} location - The location the file should be written to
 * @param  {string} content  - The content of the file
 *
 * @return {promise object}  - Boolean true for 👍 || string error for 👎
 */
var WriteFile = function WriteFile(location, content) {
	pancakes.CreateDir(Path.dirname(location));

	return new _promise2.default(function (resolve, reject) {
		Fs.writeFile(location, content, 'utf8', function (error) {
			if (error) {
				Log.error('Writing file failed for ' + Chalk.yellow(location));
				Log.error((0, _stringify2.default)(error));

				reject(error);
			} else {
				Log.verbose('Successfully written ' + Chalk.yellow(location));

				resolve(true);
			}
		});
	});
};

/**
 * Promisified reading a file
 *
 * @param  {string} location - The location of the file to be read
 *
 * @return {promise object}  - The content of the file
 */
var ReadFile = function ReadFile(location) {
	return new _promise2.default(function (resolve, reject) {
		Fs.readFile(location, 'utf8', function (error, content) {
			if (error) {
				Log.error('Reading file failed for ' + Chalk.yellow(location));
				Log.error((0, _stringify2.default)(error));

				reject(error);
			} else {
				Log.verbose('Successfully read ' + Chalk.yellow(location));

				resolve(content);
			}
		});
	});
};

/**
 * Generate Sass code for a module and it's dependencies
 *
 * @param  {string} location     - The location of the module to be compiled
 * @param  {object} dependencies - The dependencies of this module
 *
 * @return {string}              - Sass code to tie dependencies and module together
 */
var GenerateSass = function GenerateSass(location, dependencies) {
	var sass = ''; //the code goes here

	if ((0, _keys2.default)(dependencies).length) {
		var baseLocation = Path.normalize(location + '/../');

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(dependencies)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var dependency = _step.value;

				var modulePath = dependency.substring(pancakes.npmOrg.length, dependency.length);

				sass += '@import "' + Path.normalize(baseLocation + '/' + modulePath + '/dist/sass/module.scss') + '";\n';
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
	}

	sass += '@import "' + Path.normalize(location + '/dist/sass/module.scss') + '";\n';

	return sass;
};

/**
 * Compile Sass, autoprefix it and save it to disk
 *
 * @param  {string} location - The path we want to save the compiled css to
 * @param  {object} settings - The SettingsCSS object
 * @param  {string} sass     - The Sass to be compiled
 *
 * @return {promise object}  - Boolean true for 👍 || string error for 👎
 */
var Sassify = function Sassify(location, settings, sass) {
	return new _promise2.default(function (resolve, reject) {
		var compiled = Sass.render({
			data: sass,
			indentType: 'tab', //this is how real developers indent!
			outputStyle: settings.minified ? 'compressed' : 'expanded'
		}, function (error, renered) {
			if (error) {
				Log.error('Sass compile failed for ' + Chalk.yellow(location));

				reject(error.message);
			} else {
				Log.verbose('Successfully compiled Sass for ' + Chalk.yellow(location));

				Postcss([Autoprefixer({ browsers: settings.browsers })]).process(renered.css).catch(function (error) {
					return reject(error);
				}).then(function (prefixed) {
					if (prefixed) {
						prefixed.warnings().forEach(function (warn) {
							return Log.error(warn.toString());
						});

						Log.verbose('Successfully autoprefixed CSS for ' + Chalk.yellow(location));

						WriteFile(location, prefixed.css) //write the generated content to file and return its promise
						.catch(function (error) {
							Log.error(error);

							reject(error);
						}).then(function () {
							resolve(true);
						});
					}
				});
			}
		});
	});
};

/**
 * Remove duplicated lines
 *
 * @param  {string} content - A bunch of lines that COULD have duplicates
 *
 * @return {string}         - Removed duplicate lines
 */
var StripDuplicateLines = function StripDuplicateLines(content) {
	var lines = content.split('\n'); //split into each line

	if (lines[lines.length - 1] === '') {
		//remove empty line at the end
		lines.pop();
	}

	var sortedLines = [].concat((0, _toConsumableArray3.default)(new _set2.default(lines))); //make each line unique

	return sortedLines.join('\n');
};

/**
 * Minify JS so we have one function not several
 *
 * @param  {string} js   - The JS code to be minified
 * @param  {string} file - The file name for error reporting
 *
 * @return {string}    - The minified js code
 */
var MinifyJS = function MinifyJS(js, file) {

	try {
		var jsCode = UglifyJS.minify(js, {
			fromString: true
		});

		return jsCode.code;
	} catch (error) {
		Log.error('Unable to uglify js code for ' + Chalk.yellow(file));
		Log.error(error.message);

		return js;
	}
};

/**
 * Get js from module, minify depending on settings and write to disk
 *
 * @param  {string} from     - Where is the module so we can read from there
 * @param  {object} settings - The SettingsJS object
 * @param  {string} to       - Where shall we write the module to if settings allow?
 *
 * @return {promise object}  - The js code either minified or bare bone
 */
var HandelJS = function HandelJS(from, settings, to) {
	return new _promise2.default(function (resolve, reject) {
		ReadFile(from) //read the module
		.catch(function (error) {
			Log.error('Unable to read file ' + Chalk.yellow(from));
			Log.error(error);

			reject(error);
		}).then(function (content) {

			var code = '';

			if (settings.minified) {
				//minification = uglify code
				code = MinifyJS(content, from);

				Log.verbose('Successfully uglified JS for ' + Chalk.yellow(from));
			} else {
				//no minification = just copy and rename
				code = content;
			}

			if (settings.modules) {
				//are we saving modules?
				WriteFile(to, code) //write the generated content to file and return its promise
				.catch(function (error) {
					Log.error(error);

					reject(error);
				}).then(function () {
					resolve(content);
				});
			} else {
				resolve(content); //just return the promise
			}
		});
	});
};

/**
 * Minify all js modules together once their promises have resolved
 *
 * @param  {array}  allJS    - An array of promise object for all js modules which will return their code
 * @param  {object} settings - The SettingsJS object
 *
 * @return {promise object}  - Returns true once the promise is resolved
 */
var MinifyAllJS = function MinifyAllJS(allJS, settings) {
	return new _promise2.default(function (resolve, reject) {
		_promise2.default.all(allJS).catch(function (error) {
			Log.error('Compiling JS ran into an error: ' + error);
		}).then(function (js) {
			var locationJS = Path.normalize(pkgPath + '/' + settings.location + '/' + settings.name);
			var code = '';

			if (settings.minified) {
				code = MinifyJS(js.join('\n\n'), locationJS);

				Log.verbose('Successfully uglified JS for ' + Chalk.yellow(locationJS));
			} else {
				code = js.join('\n\n');
			}

			WriteFile(locationJS, code) //write file
			.catch(function (error) {
				Log.error(error);

				reject(error);
			}).then(function () {
				resolve(true);
			});
		});
	});
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Reading and merging settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Log.info('PANCAKE ADDING SYRUP');

pancakes.Loading.start(); //start loading animation

//reading local settings
var PackagePath = Path.normalize(pkgPath + '/package.json');
var PKGsource = {};
var PKG = {};

try {
	PKGsource = Fs.readFileSync(PackagePath, 'utf8');
	PKG = JSON.parse(PKGsource);

	Log.verbose('Read settings at ' + Chalk.yellow(PackagePath));
} catch (error) {
	Log.verbose('No package.json found at ' + Chalk.yellow(PackagePath));
}

if (PKG.pancake === undefined) {
	//let's make merging easy
	PKG.pancake = {};
}

//check local settings if syrup should run at all when coming from batter
if (PKG.pancake['auto-syrup'] === false && Program.batter) {
	Log.verbose('Syrup is disabled via local settings. Stopping here!');

	process.exit(0);
}

//default settings
var SettingsCSS = {
	'minified': true,
	'modules': false,
	'browsers': ['last 2 versions', 'ie 8', 'ie 9', 'ie 10'],
	'location': 'pancake/css/',
	'name': 'pancake.min.css'
};

var SettingsSASS = {
	'generate': true,
	'modules': false,
	'location': 'pancake/sass/',
	'name': 'pancake.scss'
};

var SettingsJS = {
	'minified': true,
	'modules': false,
	'location': 'pancake/js/',
	'name': 'pancake.min.js'
};

//merging default settings with local package.json
(0, _assign2.default)(SettingsCSS, PKG.pancake.css);
(0, _assign2.default)(SettingsSASS, PKG.pancake.sass);
(0, _assign2.default)(SettingsJS, PKG.pancake.js);

Log.verbose('Merged local settings with defaults:\n' + Chalk.yellow('SettingsCSS:  ' + (0, _stringify2.default)(SettingsCSS) + '\n' + ('SettingsSASS: ' + (0, _stringify2.default)(SettingsSASS) + '\n') + ('SettingsJS:   ' + (0, _stringify2.default)(SettingsJS))));

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Going through all modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var allPackages = pancakes.GetPackages(pkgPath) //read all packages and return an object per module
.catch(function (error) {
	Log.error(error);

	process.exit(1);
});

allPackages.catch(function (error) {
	Log.error('Reading all package.json files bumped into an error: ' + error);
}).then(function (allModules) {
	//once we got all the content from all package.json files
	var compiledAll = []; //for collect all promises
	var allSass = ''; //all modules to be collected for SettingsCSS.name file
	var allJS = []; //all js file paths from all pancake modules


	//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Saving settings into local package.json
	//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if (allModules.length > 0 && Program.save) {
		//only save if we found pancake modules and the flag was supplied
		Log.verbose('Saving settings into ' + Chalk.yellow(PackagePath));

		PKG.pancake.css = SettingsCSS;
		PKG.pancake.sass = SettingsSASS;
		PKG.pancake.js = SettingsJS;

		var _isSpaces = void 0;

		//detect indentation
		var indentation = 2; //default indentation even though you all should be using tabs for indentation!
		try {
			var PKGlines = PKGsource.split('\n');
			_isSpaces = PKGlines[1].startsWith('  ');
		} catch (error) {
			_isSpaces = true;
		}

		if (!_isSpaces) {
			indentation = '\t'; //here we go!
		}

		compiledAll.push(WriteFile(PackagePath, (0, _stringify2.default)(PKG, null, indentation)) //write package.json
		.catch(function (error) {
			Log.error(error);
		}));
	}

	//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Iterate over each module
	//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = (0, _getIterator3.default)(allModules), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var modulePackage = _step2.value;

			Log.verbose('Bulding ' + Chalk.yellow(modulePackage.name));

			//generate the import statements depending on dependencies
			var sass = GenerateSass(modulePackage.path, modulePackage.peerDependencies);
			allSass += sass; //for SettingsCSS.name file

			//write css file
			if (SettingsCSS.modules) {
				var location = Path.normalize(pkgPath + '/' + SettingsCSS.location + '/' + modulePackage.name.substring(pancakes.npmOrg.length + 1) + '.css');

				compiledAll.push(Sassify(location, SettingsCSS, sass) //generate css and write file
				.catch(function (error) {
					Log.error(error);
				}));
			}

			//write sass file
			if (SettingsSASS.generate) {
				var _location = Path.normalize(pkgPath + '/' + SettingsSASS.location + '/' + modulePackage.name.substring(pancakes.npmOrg.length + 1) + '.scss');

				sass = '/* ' + modulePackage.name + ' v' + modulePackage.version + ' */\n\n' + sass + '\n@include versioning-check();\n';

				compiledAll.push(WriteFile(_location, sass) //write file
				.catch(function (error) {
					Log.error(error);

					process.exit(1);
				}));
			}

			//check if there is JS
			var jsModulePath = Path.normalize(modulePackage.path + '/dist/js/module.js');

			if (Fs.existsSync(jsModulePath)) {
				Log.verbose(Chalk.green('⌘') + ' Found JS code in ' + Chalk.yellow(modulePackage.name));

				var jsModuleToPath = Path.normalize(pkgPath + '/' + SettingsJS.location + '/' + modulePackage.name.substring(pancakes.npmOrg.length + 1) + '.js');

				var jsPromise = HandelJS(jsModulePath, SettingsJS, jsModuleToPath) //compile js and write to file depending on settings
				.catch(function (error) {
					Log.error(error);
				});

				allJS.push(jsPromise); //collect all js only promises so we can save the SettingsJS.name file later
				compiledAll.push(jsPromise); //add them also to the big queue so we don't run into race conditions
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

		//write the SettingsCSS.name file
		var locationCSS = Path.normalize(pkgPath + '/' + SettingsCSS.location + '/' + SettingsCSS.name);
		allSass = '/*! PANCAKE */\n\n' + StripDuplicateLines(allSass) + //remove duplicate import lines
		'\n\n@include versioning-check();\n';

		compiledAll.push(Sassify(locationCSS, SettingsCSS, allSass) //generate SettingsCSS.name file
		.catch(function (error) {
			Log.error(error);
		}));

		//write SettingsSASS.name file
		if (SettingsSASS.generate) {
			var locationSASS = Path.normalize(pkgPath + '/' + SettingsSASS.location + '/' + SettingsSASS.name);

			compiledAll.push(WriteFile(locationSASS, allSass) //write file
			.catch(function (error) {
				Log.error(error);

				process.exit(1);
			}));
		}

		//write SettingsJS.name file
		compiledAll.push(MinifyAllJS(allJS, SettingsJS).catch(function (error) {
			Log.error(error);
		}));

		//after all files have been compiled and written
		_promise2.default.all(compiledAll).catch(function (error) {
			pancakes.Loading.stop(); //stop loading animation

			Log.error('Compiling Sass ran into an error: ' + error);
		}).then(function () {
			pancakes.Loading.stop(); //stop loading animation

			Log.ok('Your delicious pancake is ready to be consumed \uD83D\uDCA5');
		});
	} else {
		pancakes.Loading.stop(); //stop loading animation

		Log.info('No pancake modules found \uD83D\uDE2C');
	}
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
process.on('exit', pancakes.ExitHandler.bind(null, { now: Program.batter ? true : false })); //on closing
process.on('SIGINT', pancakes.ExitHandler.bind(null, { now: true })); //on [ctrl] + [c]
process.on('uncaughtException', pancakes.ExitHandler.bind(null, { now: true })); //on uncaught exceptions