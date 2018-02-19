const ExpressRequestor = require('../lib/ExpressRequestor');
const sinon = require('sinon');

module.exports = {
  testConstructor(test) {
    test.expect(2);
    const sut = new ExpressRequestor({ protocol: 'foo', headers: { host: 'bar' } });
    test.equal(sut.host, 'bar');
    test.equal(sut.protocol, 'foo');
    test.done();
  },
  test_individualRequest(test) {
    test.expect(8);
    const sut = new ExpressRequestor({ protocol: 'foo', headers: { host: 'bar' } });
    sut._doRequest = sinon.stub();
    sut._doRequest.returns(null);
    sut._individualRequest(
      'oof',
      '/lorem/ipsum',
      {},
      'fakeReq'
    );
    sut._individualRequest(
      'rab',
      'https://lorem/ipsum',
      { a: 'b' },
      'fakeReq2'
    );
    const args1 = sut._doRequest.args[0];
    const args2 = sut._doRequest.args[1];
    test.equal(args1[0], 'oof');
    test.equal(args1[1], 'foo://bar/lorem/ipsum');
    test.deepEqual(args1[2], {});
    test.equal(args1[3], 'fakeReq');
    test.equal(args2[0], 'rab');
    test.equal(args2[1], 'https://lorem/ipsum');
    test.deepEqual(args2[2], { a: 'b' });
    test.equal(args2[3], 'fakeReq2');
    test.done();
  },
  test_doRequest(test) {
    test.expect(1);
    const sut = new ExpressRequestor({ protocol: 'foo', headers: { host: 'bar' } });
    const res = sut._doRequest(
      'oof',
      '/lorem/ipsum',
      {},
      'fakeReq'
    );
    test.ok(res instanceof Promise);
    res.catch(() => test.done());
  },
};
