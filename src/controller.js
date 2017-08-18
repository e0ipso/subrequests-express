// @flow

const ExpressRequestor = require('./ExpressRequestor');
const subrequests = require('subrequests');
const util = require('util');

type enhancedRequest = express$Request & { subrequestsResponseMerger: any };

/**
 * Executes a blueprint and composes the Express response.
 *
 * @param {string} blueprint
 *   The blueprint to execute.
 * @param {enhancedRequest} req
 *   The request from Express.
 * @param {express$Response} res
 *   The response from Express.
 *
 * @return {Promise<void>}
 *   A promise that will send the request when ready.
 */
module.exports = (
  blueprint: string,
  req: enhancedRequest,
  res: express$Response
): Promise<void> => subrequests
  .request(blueprint, new ExpressRequestor(req), req.subrequestsResponseMerger)
  .then((response) => {
    // Write all the headers to the response.
    const headers = [...response.headers].reduce((heads, keyval) => {
      heads[keyval[0]] = keyval[1];
      return heads;
    }, {});
    res
      .set(headers)
      .status(parseInt(response.headers.get('Status') || '207', 10))
      .send(response.body);
  })
  .catch((e) => {
    res
      .status(500)
      .set('Content-Type', 'text/plain')
      .send(util.inspect(e, { depth: null }));
  });
