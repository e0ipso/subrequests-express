// @flow
// Note: this file is intentionally excluded from test coverage as it's standard
// express behavior. DO NOT put business logic or lots of conditional behavior
// in these routes. It doesn't belong here.

const bodyParser = require('body-parser');
const processIncomingBlueprint = require('./controller');
const Router = require('express').Router;

type subrequestsOptions = {
  host?: string,
  protocol?: string,
};

module.exports = (routePath?: string, options: subrequestsOptions = {}): express$Router => {
  const router = new Router();

  router.use(bodyParser.text({ type: '*/*' }));

  // Let the express application put the subrequests endpoint wherever they
  // need to and include variables like :version if needed. If there is no
  // configuration to be found, then default to '/subrequests'.
  router.route(routePath || '/subrequests')
    .all((req: $Subtype<express$Request>, res: express$Response, next: express$NextFunction) => {
      req.subrequestsOptions = options;
      next();
    })
    .post(
      (req: $Subtype<express$Request>, res: express$Response) =>
        processIncomingBlueprint(req.body, req, res)
    )
    .get(
      (req: $Subtype<express$Request>, res: express$Response) =>
        processIncomingBlueprint(req.query.query, req, res)
    );

  return router;
};
