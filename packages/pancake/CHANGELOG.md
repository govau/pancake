Pancake
=======

> Pancake is a tool to make working with npm on the front end easy and sweet.


## Versions

* [v1.1.0  - Optimized pancake for windows](v110)
* [v1.0.15 - Fixed mixed js and Sass module bug](v1015)
* [v1.0.14 - Tweaked to facilitate syrup](v1013)
* [v1.0.13 - Loading animation](v1013)
* [v1.0.12 - Enabled plugin install console logging](v1012)
* [v1.0.11 - Fixed lag in plugin install](v1011)
* [v1.0.10 - WIP, working on speed improvements](v1010)
* [v1.0.9  - Improving plugin install](v109)
* [v1.0.8  - Pause and resume, plugins and tests](v108)
* [v1.0.7  - Loading fixes](v107)
* [v1.0.6  - Bug hunting](v106)
* [v1.0.5  - 💥 Initial version](v105)


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## v1.1.0

- Pancake now works on windows after escaping every path separator. Other operating system, other way to break code.
	([#14](https://github.com/govau/pancake/issues/14))


## v1.0.15

- Fixed a bug where pancake would fail when we mix modules that are only Sass and only Js.


## v1.0.14

- Tweaked a couple functions so syrup can reuse them ([#17](https://github.com/govau/pancake/issues/17))


## v1.0.13

- Enabled loading animation for plugin install ([#20](https://github.com/govau/pancake/issues/20))


## v1.0.12

- stdio output to inherit so we can debug why plugin install is hanging ([#20](https://github.com/govau/pancake/issues/20))


## v1.0.11

- Fixed npm waiting for lock files inside the plugin install ([#20](https://github.com/govau/pancake/issues/20))


## v1.0.10

- Working on making the plugin install faster ([#20](https://github.com/govau/pancake/issues/20))


## v1.0.9

- Get loading working inside child.process ([#21](https://github.com/govau/pancake/issues/21))
- Increase speed in which the plugins are installed ([#20](https://github.com/govau/pancake/issues/20))


## v1.0.8

- Added pause and resume for loading
- Passing global settings to plugins now
- Added docs
- Now catching errors from plugins
- Fixed test3
- Added test9
- Now not deleting compiled folder in failed tests


## v1.0.7

- Fixed loading inside plugins
- Bumped lerna version


## v1.0.6

- Fixed some bugs


## v1.0.5

- 💥 Initial version


**[⬆ back to top](#contents)**


# };
