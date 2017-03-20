const Pancake = require('@gov.au/pancake');
const Plugin = require('./../lib/pancake');

Pancake.Batter([
		'node',
		'pancake',
		'../../tests/test7',
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

				Pancake.Log.space();
				Pancake.Loading.stop();
		});
});
