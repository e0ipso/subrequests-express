const ExpressRequestor = require('./ExpressRequestorTest');
const controller = require('./controllerTest');
const executeRoute = require('./executeRouteTest');
const endResponse = require('./endResponseTest');
const sinon = require('sinon');

module.exports = {
  setUp(cb) {
    this.stubs = [];

    this.stubWithPromise = (objToStub, functionName) => {
      const stub = sinon.stub(objToStub, functionName);
      stub.returns(Promise.resolve());
      this.stubs.push(stub);
    };

    cb();
  },

  tearDown(cb) {
    this.stubs.forEach((stub) => {
      if (typeof stub.restore === 'function') {
        stub.restore();
      }
    });
    this.stubs = [];

    cb();
  },
  ExpressRequestor,
  controller,
  executeRoute,
  endResponse,
};
