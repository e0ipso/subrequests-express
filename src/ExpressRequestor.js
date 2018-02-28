// @flow

import type { Response } from 'subrequests/types/Responses';
import type { RequestorInterface } from 'subrequests/types/Requestor';

const _ = require('lodash');
const qsUtils = require('qs');
const { HttpRequestor } = require('subrequests').lib;

const detectProtocol = new RegExp('^(?:[a-z]+:)?//', 'i');
/**
 * Detects if a url is internal of not.
 *
 * @param {string} url
 *   The URL to test.
 *
 * @returns {boolean}
 *   True if it's internal, false if it's not.
 */
function urlIsInternal(url: string): boolean {
  return !detectProtocol.test(url);
}

/**
 * @class
 *   ExpressRequestor
 * @classdesc
 *   A requestor tweaked to be used in express.
 */
class ExpressRequestor extends HttpRequestor implements RequestorInterface {
  host: string;
  protocol: string;
  defaultRequestOptions: Object;
  masterRequest: *;
  /**
   * Create a new ExpressRequestor object.
   *
   * @param {$Subtype<express$Request>} req
   *   The Express request object to the subrequests endpoint.
   */
  constructor(req: $Subtype<express$Request>) {
    super();
    const defaults = {
      host: req.headers.host,
      protocol: req.protocol,
    };
    const options = req.subrequestsOptions || {};
    const { host, protocol } = Object.assign({}, defaults, options);
    this.host = host;
    this.protocol = protocol;
    this.defaultRequestOptions = Object.assign({}, options.requestOptions);
    this.masterRequest = req;
    if (!this.masterRequest.runMiddleware) {
      this.masterRequest.runMiddleware = () => {
        let errorMessage = '"runMiddleware" was not registered properly in ';
        errorMessage += 'the express app. Please refer to the installation ';
        errorMessage += 'instructions in the README documentation for ';
        errorMessage += '"subrequests-express".';
        throw new Error(errorMessage);
      };
    }
  }

  /**
   * Execute an individual request.
   *
   * @param {string} method
   *   The HTTP method.
   * @param {string} uri
   *   The URI to make the request against.
   * @param {Object} options
   *   A list of options for the requesting library.
   * @param {string} subrequestId
   *   The ID of the request being made.
   *
   * @returns {Promise<Response>}
   *   A response promise.
   *
   * @private
   */
  _individualRequest(
    method: string,
    uri: string,
    options: Object,
    subrequestId: string
  ): Promise<Response> {
    const externalOptions = _.merge({}, this.defaultRequestOptions, options);
    // Options are slightly different if we make the request internally.
    const internalOptions = this._translateInternalOptions(externalOptions, method);
    return urlIsInternal(uri)
      // If the request is internal we don't issue an HTTP request.
      ? this._doRequest(method, uri, internalOptions, subrequestId)
      // Fallback to HTTP request if it's to a different host.
      : this._doExternalRequest(method, uri, externalOptions, subrequestId);
  }

  /**
   * Execute an individual request.
   *
   * @param {string} method
   *   The HTTP method.
   * @param {string} uri
   *   The URI to make the request against.
   * @param {Object} options
   *   A list of options for the requesting library.
   * @param {string} subrequestId
   *   The ID of the request being made.
   *
   * @returns {Promise<Response>}
   *   A response promise.
   *
   * @private
   */
  _doRequest(
    method: string,
    uri: string,
    options: Object,
    subrequestId: string
  ): Promise<Response> {
    return new Promise((resolve) => {
      const requestOverrides = Object.assign({}, options, { method });
      this.masterRequest.runMiddleware(
        uri,
        requestOverrides,
        (parsedBody, code, headers) => {
          // Include the subrequest ID in the response headers.
          headers['x-subrequest-id'] = subrequestId;
          const response = { body: JSON.stringify(parsedBody), headers };
          resolve(response);
        }
      );
    });
  }

  /**
   * Execute an individual request.
   *
   * @param {string} method
   *   The HTTP method.
   * @param {string} uri
   *   The URI to make the request against.
   * @param {Object} options
   *   A list of options for the requesting library.
   * @param {string} subrequestId
   *   The ID of the request being made.
   *
   * @returns {Promise<Response>}
   *   A response promise.
   *
   * @private
   */
  _doExternalRequest(
    method: string,
    uri: string,
    options: Object,
    subrequestId: string
  ): Promise<Response> {
    return super._individualRequest(method, uri, options, subrequestId);
  }

  /**
   * The options meant for the request module need to change for internals.
   *
   * @param {Object} options
   *   The options as used by the request module.
   * @param {string} method
   *   The HTTP method.
   *
   * @return {Object}
   *   The IncomingMessage request overrides.
   *
   * @private
   */
  _translateInternalOptions(options: Object, method: string): Object {
    const headers = _.get(options, 'headers', {});
    const rawHeaders = Object.keys(headers).reduce((carry, name) => {
      carry.push(name);
      carry.push(options.headers[name]);
      return carry;
    }, []);
    const internalOptions: Object = {
      query: options.qs || {},
      method,
      headers,
      rawHeaders,
    };
    if (options.body) {
      internalOptions.body = options.body;
    }
    return internalOptions;
  }

  /**
   * Parses the query string and returns the uri and query object.
   *
   * @param {string} uri
   *   The URI with query string encoded.
   *
   * @return {{uri: string, qs: *}}
   *   The query string and URI.
   *
   * @protected
   */
  _parseQueryString(uri: string) {
    const parts = uri.split('?');
    const qs = qsUtils.parse(parts[1] || '', {
      allowPrototypes: true,
    });
    return { uri, qs };
  }
}

module.exports = ExpressRequestor;
