/***************************************************************************************************************************************************************
 *
 * Getting remote json file
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
import Request from 'request';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style } from '@gov.au/pancake';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Exports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Get remote json file and return it’s data
 *
 * @param  {string} url - The URL of the remote json file
 *
 * @return {object}     - The parsed object of the json content
 */
export const GetRemoteJson = url => {
	Log.verbose(`Getting json file from: ${ Style.yellow( url ) }`);

	return new Promise( ( resolve, reject ) => {
		Request.get(
			{
				url: url,
				json: true,
				headers: {
					'User-Agent': 'pancake', //well, duh!
				},
			}, ( error, result, data ) => {
				if( error ) {
					Log.error( error );

					if( error.code === 'ENOTFOUND' ) {
						reject(`Unable to find the json file online. Make sure you’re online.`);
					}
					else {
						reject( error );
					}
				}
				else if( result.statusCode !== 200 ) {
					reject(`Request to ${ Style.yellow( url ) } returned: ${ Style.yellow( result.statusCode ) }`);
				}
				else {
					resolve( data );
				}
			}
		);
	});
};
