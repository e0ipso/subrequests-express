const _ = require('lodash');
const endResponse = require('./endResponse');

/**
 * Creates a new request object based on an existing request and some overrides.
 *
 * @param {string} path
 *   The route path to execute.
 * @param {IncomingMessage} originalReq
 *   The original request object.
 * @param {Object} requestOverrides
 *   Manual overrides for the request.
 *
 * @return {Object}
 *   The newly created request object.
 */
const createRequest = (path, originalReq, requestOverrides = {}) => {
  // Clone the original request.
  const newReq = _.cloneDeep(originalReq);
  // Delete all private properties since those should be computed.
  Object.keys(newReq)
    .filter(key => key[0] === '_')
    .forEach((key) => {
      delete newReq[key];
    });
  // Apply overrides.
  Object.keys(requestOverrides)
    .forEach((key) => {
      newReq[key] = requestOverrides[key];
    });
  // Override the URL.
  newReq.url = path;
  newReq.originalUrl = path;
  // Make sure the request method is uppercase.
  newReq.method = newReq.method.toUpperCase();
  newReq.originalMethod = newReq.method;

  return newReq;
};

/**
 * Creates a response that other middlewares can interact with.
 *
 * @param {ServerResponse} originalRes
 *   The original response.
 * @param {IncomingMessage} req
 *   The modified request object.
 * @param {function} callback
 *   Instead of terminating the response as express would normally do upon
 *   calling res.end, we will execute this callback.
 *
 * @return {Object}
 *   A response mock that contains the most commonly called response methods.
 */
const createResponse = (originalRes, req, callback) => {
  // Clone the original response.
  const newRes = _.cloneDeep(originalRes);
  // Set the modified request object.
  newRes.req = req;

  // Response termination using our custom callback instead.
  newRes.end = endResponse(newRes, callback);
  newRes.send = newRes.end;
  newRes.write = newRes.end;

  return newRes;
};

/**
 * Creates the request and response objects.
 *
 * @param {string} path
 *   The route path to execute.
 * @param {IncomingMessage} req
 *   The original request object.
 * @param {ServerResponse} res
 *   The original response object.
 * @param {Object} requestOverrides
 *   Manual overrides for the request.
 * @param {function} callback
 *   Instead of terminating the response as express would normally do upon
 *   calling res.end, we will execute this callback.
 *
 * @return {[IncomingMessage, ServerResponse]}
 *   A tuple containing the request and response objects.
 */
const createRequestAndResponse = (path, req, res, requestOverrides, callback) => {
  callback = _.once(callback);
  const newRew = createRequest(path, req, requestOverrides);
  const newRes = createResponse(res, newRew, callback);
  return [newRew, newRes];
};

module.exports = (app) => {
  app.use((req, res, next) => {
    req.runMiddleware = (path, requestOverrides, callback) => {
      app.runMiddleware(path, req, res, requestOverrides, callback);
    };
    next();
  });

  // Only add once to the app object.
  if (app.runMiddleware) {
    return;
  }

  app.runMiddleware = (path, req, res, requestOverrides, callback) => {
    const tuple = createRequestAndResponse(path, req, res, requestOverrides, callback);
    app(tuple[0], tuple[1]);
  };
};
