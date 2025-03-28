import dotenv from 'dotenv';
import { GPTController } from '../src/components/apis/GPTController';
import { assert } from 'chai';

dotenv.config();

describe('GPT Controller', function () {
    it('should respond correctly to "Say this is a test"', function (done) {
        this.timeout(100000);
        GPTController.getInstance()
            .ask('Say this is a test')
            .then((response) => {
                assert.equal(response, 'This is a test.');
                done();
            });
    });
});
