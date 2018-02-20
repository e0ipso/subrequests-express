const controller = require('../lib/controller');
const sinon = require('sinon');
const subrequests = require('subrequests');

module.exports = {
  testSuccess(test) {
    test.expect(3);
    subrequests.request = sinon.stub();
    subrequests.request.returns(Promise.resolve({
      headers: new Map([['foo', 'bar']]),
      body: 'lorem ipsum',
    }));
    const res = {};
    // Stub the fluent interface.
    res.set = sinon.stub();
    res.set.returns(res);
    res.set = sinon.stub();
    res.set.returns(res);
    res.status = sinon.stub();
    res.status.returns(res);
    res.send = sinon.stub();
    res.send.returns(res);
    controller('', { headers: {}, runMiddleware: sinon.stub() }, res)
      .then(() => {
        test.deepEqual(res.set.args[0][0], { foo: 'bar' });
        test.equal(res.status.args[0][0], 207);
        test.equal(res.send.args[0][0], 'lorem ipsum');
        test.done();
      });
  },
  testSuccessWithStatus(test) {
    test.expect(1);
    subrequests.request = sinon.stub();
    subrequests.request.returns(Promise.resolve({
      headers: new Map([['Status', '1234']]),
      body: '',
    }));
    const res = {};
    // Stub the fluent interface.
    res.set = sinon.stub();
    res.set.returns(res);
    res.set = sinon.stub();
    res.set.returns(res);
    res.status = sinon.stub();
    res.status.returns(res);
    res.send = sinon.stub();
    res.send.returns(res);
    controller('', { headers: {}, runMiddleware: sinon.stub() }, res)
      .then(() => {
        test.equal(res.status.args[0][0], 1234);
        test.done();
      });
  },
  testFail(test) {
    test.expect(4);
    subrequests.request = sinon.stub();
    subrequests.request.callsFake(() => Promise.reject(new Error('Foo!')));
    const res = {};
    // Stub the fluent interface.
    res.set = sinon.stub();
    res.set.returns(res);
    res.set = sinon.stub();
    res.set.returns(res);
    res.status = sinon.stub();
    res.status.returns(res);
    res.send = sinon.stub();
    res.send.returns(res);
    controller('', { headers: {}, runMiddleware: sinon.stub() }, res)
      .then(() => {
        test.equal(res.status.args[0][0], 500);
        test.equal(res.set.args[0][0], 'Content-Type');
        test.equal(res.set.args[0][1], 'text/plain');
        test.ok(res.send.args[0][0].indexOf('Error: Foo!') !== -1);
        test.done();
      });
  },
};
