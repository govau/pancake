const Plugin = require('./../lib/pancake');

Plugin.pancake(
	[
		{ name: '@gov.au/testmodule1',
			version: '11.0.1',
			peerDependencies: {},
			pancake: {
				'pancake-module': {
					"version":"1.0.0",
					"plugins": [
						"@gov.au/pancake-sass",
						"@gov.au/pancake-js"
					],
					"sass": {
						"path": "lib/sass/_module.scss",
						"sass-versioning": true
					},
					"js": {
						"path": "lib/js/module.js"
					}
				}
			},
			path: '/Users/dominikwilkowski/Sites/DTA/pancake/tests/test7/node_modules/@gov.au/testmodule1'
		},
		{
			name: '@gov.au/testmodule2',
			version: '13.0.0',
			peerDependencies: {
				'@gov.au/testmodule1': '^11.0.1'
			},
			pancake: {
				'pancake-module': {
					"version":"1.0.0",
					"plugins": [
						"@gov.au/pancake-sass",
						"@gov.au/pancake-js"
					],
					"sass": {
						"path": "lib/sass/_module.scss",
						"sass-versioning": true
					},
					"js": {
						"path": "lib/js/module.js"
					}
				}
			},
			path: '/Users/dominikwilkowski/Sites/DTA/pancake/tests/test7/node_modules/@gov.au/testmodule2'
		}
	],

	{
		"auto-save": false,
		"plugins": true,
		"ignore": [],
	},

	'/Users/dominikwilkowski/Sites/DTA/pancake/tests/test7'
);
