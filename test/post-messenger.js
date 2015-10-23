/* global describe, it, chai */

describe('assert', function () {
    var assert = chai.assert;

    it('assert', function () {
        var foo = 'test';
        assert(foo === 'test', "test");
    });
});
