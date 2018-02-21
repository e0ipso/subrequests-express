const executeRoute = require('../lib/executeRoute');
const sinon = require('sinon');
const { IncomingMessage, ServerResponse } = require('http');

module.exports = {
  testMiddlewareAttachment(test) {
    test.expect(12);
    const fakeApp = sinon.stub();
    fakeApp.use = sinon.stub();
    executeRoute(fakeApp);
    executeRoute(fakeApp);
    test.ok(fakeApp.use.called);
    const middleware = fakeApp.use.args[0][0];
    test.equal(typeof fakeApp.runMiddleware, 'function');
    const req = Object.create(IncomingMessage.prototype);
    req._prop = 'prop';
    const res = Object.create(ServerResponse.prototype);
    const cb = sinon.stub();
    const requestOverrides = { query: 'query', method: 'WoRk' };
    fakeApp.runMiddleware('path', req, res, requestOverrides, cb);
    test.ok(fakeApp.called);
    const newReq = fakeApp.args[0][0];
    const newRes = fakeApp.args[0][1];
    test.equal(newReq.query, 'query');
    test.equal(newReq.method, 'WORK');
    test.equal(newReq.url, 'path');
    test.equal(typeof newReq._prop, 'undefined');
    test.ok(!cb.called);
    newRes.end('Ended!');
    test.ok(cb.called);
    const next = sinon.stub();
    middleware(req, res, next);
    test.ok(next.called);
    test.equal(typeof req.runMiddleware, 'function');
    const stub = sinon.stub(fakeApp, 'runMiddleware');
    req.runMiddleware();
    test.ok(stub.called);
    stub.restore();
    test.done();
  },
};
