const endResponse = require('../lib/endResponse');
const sinon = require('sinon');

module.exports = {
  testWithHeaders(test) {
    test.expect();
    const fakeRes = {
      _headerNames: { foo: 'value' },
      getHeader(name) {
        return this._headerNames[name];
      },
    };
    const callback = sinon.stub();
    const ender = endResponse(fakeRes, callback);
    ender({});
    const headers = callback.args[0][2];
    test.deepEqual(headers, { foo: 'value' });
    test.done();
  },
};
