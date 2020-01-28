# this builds overpass turbo

PEGJS = ./node_modules/pegjs/bin/pegjs

all:
	npm update
	npm run build

clean:
	rm parser.js
