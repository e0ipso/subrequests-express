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
const { subrequestsRouterFactory } = require('subrequests-express');

// All your route declarations.
// …
const app = express();

const options = {};
// Add the request aggregator on the '/subrequests' route.
router.use(subrequestsRouterFactory('/subrequests', options, app));
```

This will add a route in `/subrequests` that will process blueprints either by GET or POST requests.

#### Options

Subrequests is very useful when you are making internal requests. Without any options, subrequests
will use the hostname in the master request to issue relative requests. A request is considered
internal if it has a `uri` that it's a path instead of a fully qualified URL.

  - **`host`**: The host to use for internal requests. Ex: `localhost`.
  - **`port`**: The port to use for internal requests. Ex: `3000`.

#### Customize the Response Format

You can provide a subresponse merger plugin by attaching it to the express request object under the
`subrequestsResponseMerge` key. You can do something like:

```js
// app.js
const { subrequestsRouterFactory } = require('subrequests-express');
const JsonResponse = require('subrequests-json-merger');

// All your route declarations.
// …
const app = express();

router.all('/subrequests', (req, res, next) => {
  // Make sure that subrequests-json-merger merges responses using JSON.
  req.subrequestsResponseMerger = JsonResponse;
  next();
});
// Request aggregator.
router.use(subrequestsRouterFactory('/subrequests', {}, app));

```

#### Defaults for request

You can override properties of the generated request objects (IncomingMessage) by attaching it to
the express request object under the `subrequestsOptions.requestOptions` key. You can do something
like:

```js
// app.js
const { subrequestsRouterFactory } = require('subrequests-express');

// All your route declarations.
// …
const app = express();

router.all('/subrequests', (req, res, next) => {
  // Make sure that subrequests-json-merger merges responses using JSON.
  req.subrequestsResponseMerger = JsonResponse;
  next();
});
// Request aggregator.
router.use(
  (req, res, next) => {
    req.subrequestsOptions = {
      requestOptions: { headers: { 'X-Powered-By': 'Subrequests'} },
    };
    next();
  },
  subrequestsRouterFactory(
    '/subrequests',
    { host: 'localhost', port: 3000 },
    app
  )
);

```

### On the Consumer Application

Use the request aggregator normally under `/subrequests` or the configured route. See
[Subrequests](https://github.com/e0ipso/subrequests#readme) for more information on how to use
Subrequests.
