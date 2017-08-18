# Subrequests Express

[![Coverage Status](https://coveralls.io/repos/github/e0ipso/subrequests-express/badge.svg)](https://coveralls.io/github/e0ipso/subrequests-express)
[![Known Vulnerabilities](https://snyk.io/test/github/e0ipso/subrequests-express/badge.svg)](https://snyk.io/test/github/e0ipso/subrequests-express)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Greenkeeper badge](https://badges.greenkeeper.io/e0ipso/subrequests-express.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/e0ipso/subrequests-express.svg?branch=master)](https://travis-ci.org/e0ipso/subrequests-express)

## Usage

### On the Express Server

To support subrequests in your express server you only need to add it to your router.

```js
// app.js
const { SubrequestsRouter } = require('subrequests-express');

// All your route declarations.
// …

// Add the request aggregator.
router.use(SubrequestsRouter);
```

This will add a route in `/subrequests` that will process blueprints either by GET or POST requests.

#### Customize the Route

In order to customize the route of the request aggregator you will need to add it to your
configuration object using `config`.

Set the route in the configuration json/yaml for your environment.

```yml
subrequests:
  route: '/:version/my-request-aggregator'
```

That will accept requests to `https://example.org/^v5.0.1/my-request-aggregator`, for instance.
Note that you can include parameters that Express will process normally.

#### Customize the Response Format

You can provide a subresponse merged plugin by attaching it to the express request object under the
`subrequestsResponseMerge` key. You can do something like:

```js
// app.js
const { SubrequestsRouter } = require('subrequests-express');
const JsonResponse = require('subrequests-json-merger');

// All your route declarations.
// …

router.all(config.get('subrequests.route'), (req, res, next) => {
  // Make sure that subrequests-json-merger merges responses using JSON.
  req.subrequestsResponseMerger = JsonResponse;
  next();
});
// Request aggregator.
router.use(SubrequestsRouter);

```

### On the Consumer Application

Use the request aggregator normally under `/subrequests` or the configured route. See
[Subrequests](https://github.com/e0ipso/subrequests#readme) for more information on how to use
Subrequests.
