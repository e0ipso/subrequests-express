const _ = require('lodash');

module.exports = (newRes, callback) => (data) => {
  const headerNames = _.get(newRes, '_headerNames', {});
  const names = Object.keys(headerNames);
  const headers = names.reduce(
    (heads, name) => Object.assign(heads, { [name]: newRes.getHeader(name) }),
    {}
  );
  callback(data, newRes.statusCode, headers);
};
