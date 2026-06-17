.PHONY: build test coverage lint

build: dist/index.js

dist/index.js: src/index.js preprocess.js
	node preprocess.js

test: dist/index.js
	node test/run.mjs

coverage: dist/index.js
	npx c8 --reporter text --reporter html node test/run.mjs

lint:
	npx tsc
