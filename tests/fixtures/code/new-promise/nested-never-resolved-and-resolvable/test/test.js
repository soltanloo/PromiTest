// test.js

const assert = require('assert');
const { foo } = require('../index.js');

describe('foo test', function () {
    it('should resolve bar Promise', function (done) {
        foo().catch(() => {
            done();
        });
    });
});
