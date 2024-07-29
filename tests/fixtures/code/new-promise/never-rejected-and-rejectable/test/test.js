// test.js

const assert = require('assert');
const {
	foo
} = require('../index.js');

describe('foo test', function () {
	it('should resolve Promise', function (done) {
		foo(true).then(() => {
			done()
		});
	})
})
