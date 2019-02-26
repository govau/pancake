/***************************************************************************************************************************************************************
 *
 * Plug-in for Pancake
 *
 * Move SVGs and generate SVG sprites and fallback PNGs
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
const Path = require( 'path' );
const Fs = require( 'fs' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const { Log, Style, Loading, CopyFile, ReadFile, WriteFile } = require( '@gov.au/pancake' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Plugin export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * The main pancake method for this plugin
 *
 * @param  {array}  version        - The version of mother pancake
 * @param  {array}  modules        - An array of all module objects
 * @param  {object} settings       - An object of the host package.json file and it’s path
 * @param  {object} GlobalSettings - An object of the global settings
 * @param  {object} cwd            - The path to the working directory of our host package.json file
 *
 * @return {Promise object}  - Returns an object of the settings we want to save
 */
module.exports.pancake = ( version, modules, settings, GlobalSettings, cwd ) => {
	Loading.start('pancake-svg');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGS = {
		svg: {
			modules: false,
			pngs: 'pancake/svg/png/',
			location: 'pancake/svg/',
			name: 'pancake.sprite.svg',
		},
	};

	//merging settings with host settings
	Object.assign( SETTINGS.svg, settings.svg );


	return new Promise( ( resolve, reject ) => {
		//some housekeeping
		if( typeof version !== 'string' ) {
			reject(
				`Plugin pancake-svg got a mismatch for the data that was passed to it! ${ Style.yellow(`version`) } was ${ Style.yellow( typeof version ) } ` +
				`but should have been ${ Style.yellow(`string`) }`
			);
		}

		if( typeof modules !== 'object' ) {
			reject(
				`Plugin pancake-svg got a mismatch for the data that was passed to it! ${ Style.yellow(`modules`) } was ${ Style.yellow( typeof modules ) } ` +
				`but should have been ${ Style.yellow(`object`) }`
			);
		}

		if( typeof settings !== 'object' ) {
			reject(
				`Plugin pancake-svg got a mismatch for the data that was passed to it! ${ Style.yellow(`settings`) } was ${ Style.yellow( typeof settings ) } ` +
				`but should have been ${ Style.yellow(`object`) }`
			);
		}

		if( typeof cwd !== 'string' ) {
			reject(
				`Plugin pancake-svg got a mismatch for the data that was passed to it! ${ Style.yellow(`cwd`) } was ${ Style.yellow( typeof cwd ) } ` +
				`but should have been ${ Style.yellow(`string`) }`
			);
		}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Variables to be filled
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		let compiledAll = [];      //for collect all promises


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Iterate over each module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		for( const modulePackage of modules ) {
			Log.verbose(`SVG: Building ${ Style.yellow( modulePackage.name ) }`);

			//check if there are svg files
			const sassModulePath = Path.normalize(`${ modulePackage.path }/${ modulePackage.pancake['pancake-module'].svg.path }`);

			if( !Fs.existsSync( sassModulePath ) ) {
				Log.verbose(`SVG: No SVG found in ${ Style.yellow( sassModulePath ) }`)
			}
			else {
				Log.verbose(`SVG: ${ Style.green('⌘') } Found SVG files in ${ Style.yellow( sassModulePath ) }`);
			}
		}


		if( modules.length < 1 ) {
			Loading.stop('pancake-svg'); //stop loading animation

			Log.info(`No pancake modules found 😬`);
			resolve( SETTINGS );
		}
		else {

			//get all svgs
			const svgs = Fs
				.readdirSync( SVGModulePath )                                   //read all files in the svg folder
				.filter( name => !name.startsWith('.') )                        //let’s hide hidden files
				.map( name => Path.normalize(`${ SVGModulePath }/${ name }`) ); //making them absolute paths

			//convert svg to png
			if( SettingsSVG.pngs !== false ) {
				Log.verbose(`Converting svgs to PNGs for ${ Style.yellow( modulePackage.name ) }`);

				const location = Path.normalize(`${ pkgPath }/${ SettingsSVG.pngs }/`);

				CreateDir( location );  //create directory

				console.log = text => {};        //temporarily display console

				compiledAll.push( SvgToPng.convert( svgs, location ) );

				console.log = function( text ) { //enable again
					process.stdout.write(`${ Util.format.apply( null, arguments ) }\n`);
				};
			}

			//create svg sprite
			if( SettingsSVG.name !== false ) {
				Log.verbose(`Converting svgs to sprite for ${ Style.yellow( modulePackage.name ) }`);

				const location = Path.normalize(`${ pkgPath }/${ SettingsSVG.location }/${ SettingsSVG.name }`);

				// console.log(SvgGenerator);

				// SvgGenerator.spriteFromFiles([ SVGModulePath, location ])
				// 	.then(function (rs) {
				// 		console.log(rs);
				// });

				// console.log(result);

				const spriter = new SVGSpriter({
					dest: location,
					log: null, // Logging verbosity (default: no logging)
					shape: { // SVG shape related options
						id: { // SVG shape ID related options
							separator: '--', // Separator for directory name traversal
							generator: function (name) { return name.split('.')[0]; }, // SVG shape ID generator callback
							pseudo: '~' // File name separator for shape states (e.g. ':hover')
						},
						transform: ['svgo'], // List of transformations / optimizations
						meta: null, // Path to YAML file with meta / accessibility data
						align: null, // Path to YAML file with extended alignment data
						dest: 'opt' // Output directory for optimized intermediate SVG shapes
					},
					svg: { // General options for created SVG files
						xmlDeclaration: true, // Add XML declaration to SVG sprite
						doctypeDeclaration: true, // Add DOCTYPE declaration to SVG sprite
						namespaceIDs: true, // Add namespace token to all IDs in SVG shapes
						namespaceClassnames: true, // Add namespace token to all CSS class names in SVG shapes
						dimensionAttributes: true // Width and height attributes on the sprite
					},
					variables: {}, // Custom Mustache templating variables and functions
					mode: {
						symbol: true,
						shapes: false
					}
				});

				svgs.map( svg => {
					spriter.add( svg, null, Fs.readFileSync( svg, { encoding: 'utf-8' } ) );
				});

				spriter.compile( ( error, result ) => {
					console.log(result);
					for (var mode in result) {
						for (var resource in result[mode]) {
							mkdirp.sync(path.dirname(result[mode][resource].path));
							fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
						}
					}
				});
			}


			//after all files have been compiled and written
			Promise.all( compiledAll )
				.catch( error => {
					Loading.stop('pancake-svg'); //stop loading animation

					Log.error(`SVG plugin ran into an error: ${ error }`);
				})
				.then( () => {
					Loading.stop('pancake-svg'); //stop loading animation

					Log.ok('SVG PLUGIN FINISHED');
					resolve( SETTINGS );
			});
		}

	});
}
