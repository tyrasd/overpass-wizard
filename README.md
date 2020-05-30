overpass-wizard
===============

Generates [Overpass API](http://overpass-api.de) queries from [human friendly](http://wiki.openstreetmap.org/wiki/Overpass_turbo/Wizard) input. As seen in [overpass turbo](http://overpass-turbo.eu/).

[![Build Status](https://secure.travis-ci.org/tyrasd/overpass-wizard.png)](https://travis-ci.org/tyrasd/overpass-wizard)

command line utility
--------------------

      $ npm install -g overpass-wizard
      $ # basic usage
      $ overpass-wizard "amenity=drinking_water"
      $ # example usage: grab data from Overpass API and display on geojson.io
      $ overpass-wizard "amenity=drinking_water in Rome" | query-overpass | geojsonio
      $ # list command line options
      $ overpass-wizard --help

API
---

Install via npm: `npm install --save overpass-wizard`. The module exposes a single function that takes the search string and an optional option object as arguments:

### function(search, options)

* `search`: the wizard search string to be concerted into an Overpass API query
* `options`: optional options
  * `outputFormat`: output [data format](http://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#Output_Format_.28out.29). either `json` (default) or `xml`
  * `outputMode`: specifies the output mode. either `recursive`, `recursive_meta` or any valid value of the Overpass [out statement](http://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#Print_.28out.29) (default: `geom`)
  * `timeout`: query [timeout](http://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#timeout) in seconds (default: 25)
  * `maxsize`: memory [limit](http://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#Element_limit_.28maxsize.29) in bytes
  * `globalBbox`: produces a [global bounding box](http://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#Global_bounding_box_.28bbox.29) query (default: true)
  * `compactNWR`: produces a query with `nwr` statements if possible (instead of listing `node`, `way` and `relation` separately), resulting in more compact results (default: true)
  * `aroundRadius`: radius (in m) to be used with `around <location>` searches (default: 1000)
  * `comment`: boolean or string. if false, no comments will be added to the Overpass query output. if it is a string, it will be used in the header to explain what the query is doing
  * `freeFormPresets`: (*experimental*) path to a JSON file with a presets object in the [schema](https://github.com/openstreetmap/iD/blob/develop/data/presets/presets.json) used by the iD editor. Used to expand *free form* search input (e.g. `Hotel in Vienna`). Each preset is a named object that must have fields `name`, `terms`, `geometry` and `tags`. Presets with `searchable:false` are ignored.
