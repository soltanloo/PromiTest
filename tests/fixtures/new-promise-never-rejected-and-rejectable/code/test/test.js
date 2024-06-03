// test.js

const assert = require('assert');
const {
	foo
} = require('../index.js');

describe.only('foo test', function () {
	it('should resolve bar Promise', function (done) {
		foo().then(done);
	})
})
