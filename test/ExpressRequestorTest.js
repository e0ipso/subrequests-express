const ExpressRequestor = require('../lib/ExpressRequestor');
const qs = require('qs');
const sinon = require('sinon');

module.exports = {
  testConstructor(test) {
    test.expect(2);
    const sut = new ExpressRequestor({
      protocol: 'foo',
      headers: { host: 'bar' },
      runMiddleware: sinon.stub(),
    });
    test.equal(sut.host, 'bar');
    test.equal(sut.protocol, 'foo');
    test.done();
  },
  test_individualRequest(test) {
    test.expect(8);
    const sut = new ExpressRequestor({
      protocol: 'foo',
      headers: { host: 'bar' },
      runMiddleware: sinon.stub(),
    });
    sut._doRequest = sinon.stub();
    sut._doRequest.returns(null);
    sut._doExternalRequest = sinon.stub();
    sut._doExternalRequest.returns(null);
    sut._individualRequest(
      'oof',
      '/lorem/ipsum',
      {},
      'fakeReq'
    );
    sut._individualRequest(
      'rab',
      'https://lorem/ipsum',
      { headers: { a: 'b' }, body: 'the-body' },
      'fakeReq2'
    );
    const args1 = sut._doRequest.args[0];
    const args2 = sut._doExternalRequest.args[0];
    test.equal(args1[0], 'oof');
    test.equal(args1[1], '/lorem/ipsum');
    test.deepEqual(args1[2], {
      query: {},
      method: 'oof',
      headers: {},
      rawHeaders: [],
    });
    test.equal(args1[3], 'fakeReq');
    test.equal(args2[0], 'rab');
    test.equal(args2[1], 'https://lorem/ipsum');
    test.deepEqual(args2[2], { headers: { a: 'b' }, body: 'the-body' });
    test.equal(args2[3], 'fakeReq2');
    test.done();
  },
  test_doExternalRequest(test) {
    test.expect(1);
    const sut = new ExpressRequestor({
      protocol: 'foo',
      headers: { host: 'bar' },
      runMiddleware: sinon.stub(),
    });
    const res = sut._doExternalRequest(
      'oof',
      'https://lorem/ipsum',
      {},
      'fakeReq'
    );
    test.ok(res instanceof Promise);
    res.catch(() => test.done());
  },
  test_doRequest(test) {
    test.expect(1);
    const sut = new ExpressRequestor({
      protocol: 'foo',
      headers: { host: 'bar' },
      runMiddleware: sinon.stub(),
    });
    const res = sut._doRequest(
      'oof',
      '/lorem/ipsum',
      {},
      'fakeReq'
    );
    test.ok(res instanceof Promise);
    test.done();
  },
  testRunMiddleware(test) {
    test.expect(1);
    const sut = new ExpressRequestor({
      protocol: 'foo',
      headers: { host: 'bar' },
      runMiddleware: (uri, requestOverrides, cb) => {
        cb({ the: 'body' }, 999, { kii: 'eef' });
      },
    });
    sut._doRequest(
      'oof',
      '/lorem/ipsum',
      {},
      'fakeReq'
    )
      .then((res) => {
        test.deepEqual(res, {
          body: '{"the":"body"}',
          headers: { kii: 'eef', 'x-subrequest-id': 'fakeReq' },
        });
        test.done();
      });
  },
  testMissingRunMiddleware(test) {
    test.expect(1);
    test.throws(() => new ExpressRequestor({
      protocol: 'foo',
      headers: { host: 'bar' },
    }), 'Error');
    test.done();
  },
  test_parseQueryString(test) {
    test.expect(2);
    const sut = new ExpressRequestor({
      protocol: 'foo',
      headers: { host: 'bar' },
      runMiddleware: sinon.stub(),
    });
    sinon.stub(qs, 'parse');
    const res = sut._parseQueryString('foo#bar$baz');
    test.equal(res.uri, 'foo#bar$baz');
    test.ok(qs.parse.called);
    qs.parse.restore();
    test.done();
  },
};
