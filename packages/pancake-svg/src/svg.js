/***************************************************************************************************************************************************************
 *
 * Generate and compile SVG's
 *
 * @repo    - https://github.com/govau/pancake
 * @author  - Dominik Wilkowski
 * @contributor - Michael Arthur
 * @license - https://raw.githubusercontent.com/govau/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import Path from 'path';
import Fs from 'fs';
import SVGSpriter from 'svg-sprite';
const svgToImg = require('svg-to-img');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Included modules
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style, ReadFile, WriteFile, CreateDir } from '@gov.au/pancake';


export const SvgToPng = (svgs, location, compiledAll) => {
	CreateDir(location);

	svgs.map( svg => {
		compiledAll.push(svgToImg.from(Fs.readFileSync( svg, { encoding: 'utf-8' } )).to({
			type: 'png',
			path: Path.join(location, Path.basename(svg, '.svg') + '.png')
		}));
	});
};


export const CompileAllSvgs = ( compiledAll, SettingsSVG, pkgPath, modulePackage ) => {
	return new Promise( ( resolve, reject ) => {
		Promise.all( compiledAll )
			.catch( error => {
				Log.error(`SVG: Compiling SVG ran into an error: ${ error }`);
			})
			.then( ( svgModulePath ) => {

			//get all svgs
			const svgs = Fs
				.readdirSync( `${svgModulePath}` )                              //read all files in the svg folder
				.filter( name => !name.startsWith('.') )                        //let’s hide hidden files
				.map( name => Path.normalize(`${ svgModulePath }/${ name }`) ); //making them absolute paths

			//convert svg to png
			if( SettingsSVG.pngs !== false ) {
				Log.verbose(`SVG: Converting svgs to PNGs`);

				const location = Path.normalize(`${ pkgPath }/${ SettingsSVG.pngs }/`);

				SvgToPng( svgs, location, compiledAll );

			}

			//create svg sprite
			if( SettingsSVG.name !== false ) {

				const location = Path.normalize(`${ pkgPath }/${ SettingsSVG.location }/`);

				const spriter = new SVGSpriter({
					dest: location,
					log: null, // Logging verbosity (default: no logging),
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
						symbol: {
							sprite: SettingsSVG.name,
						},
						shapes: false
					}
				});
				Log.verbose(`SVG: Adding sprites to the sprite machine`);
				svgs.map( svg => {
					spriter.add( svg, null, Fs.readFileSync( svg, { encoding: 'utf-8' } ) );
				});

				Log.verbose(`SVG: Compile sprites into spritesheet`);
				spriter.compile( ( error, result ) => {
					if( error ) {
						Log.error( error );
						return reject( error );
					}

					for (let mode in result) {
						for (let resource in result[mode]) {
							fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
						}
					}

					resolve( true );


				});
			}
		});
	});
};
