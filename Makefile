# this builds overpass turbo

PEGJS = ./node_modules/pegjs/bin/pegjs

all:
	$(PEGJS) -o size < wizard.pegjs > parser.js

clean:
	rm parser.js
