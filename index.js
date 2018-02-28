// The ./lib directory is generated at installation time by the flow
// compilation process.
const subrequestsRouterFactory = require('./lib');
const ExpressRequestor = require('./lib/ExpressRequestor');

module.exports = { subrequestsRouterFactory, ExpressRequestor };
