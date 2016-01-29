# Innometrics helper

## Tests:
Before run tests install all dependecies.
```
$ npm i
```
### Local tests (using phantomjs and webkit).
```
$ npm test-local
```
### Local tests (using local browsers).
```
$ npm test-local-manual
```
and open test/index.html on your browser.
### Remote tests (using Browserstack).
Create file "browsers.json" into root of the project with config. (You can see example in test/example_browsers.json file).
```
$ BROWSERSTACK_USERNAME='username' BROWSERSTACK_KEY='key' npm run test-remote
```