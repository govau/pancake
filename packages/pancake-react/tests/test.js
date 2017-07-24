const Pancake = require('@gov.au/pancake');
const Plugin = require('./../lib/pancake');

Pancake.Batter([
		'node',
		'pancake',
		'../../tests/test10',
	])
	.catch( error => {
		process.exit( 1 ); //failed! :(
	})
	.then( SETTINGS => {

		Plugin.pancake(
				SETTINGS.version,
				SETTINGS.modules,
				SETTINGS.settings,
				SETTINGS.cwd
			)
			.catch( error => {
				process.exit( 1 ); //failed! :(
			})
			.then( result => {
				Pancake.Log.info(`SETTINGS RETURNED:\n\n${ JSON.stringify( result, null, '\t' ) }`);

				Pancake.Loading.stop();
				Pancake.Log.space();
		});
});
