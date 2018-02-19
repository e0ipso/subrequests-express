// @flow

import type { Response } from 'subrequests/types/Responses';
import type { RequestorInterface } from 'subrequests/types/Requestor';

const _ = require('lodash');
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
    const actualOptions = _.merge({}, this.defaultRequestOptions, options);
    // If the request is for this host, then add it before making the request.
    // This is specially useful to reuse blueprints across environments.
    if (urlIsInternal(uri)) {
      uri = `${this.protocol}://${this.host}${uri}`;
    }
    // If not, then just do the HTTP request.
    return this._doRequest(method, uri, actualOptions, subrequestId);
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
    return super._individualRequest(method, uri, options, subrequestId);
  }
}

module.exports = ExpressRequestor;
