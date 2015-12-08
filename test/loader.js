/* global describe, it, chai, Loader, $ */

var assert = chai.assert;

describe('Loader', function () {
    it('should be show loader', function (done) {
        Loader.show();
        var loader = $('#inno-loader');
        assert.ok(loader);
        assert.strictEqual(loader.css('display'), 'block');
        done();
    });

    it('should be hide loader', function (done) {
        Loader.show();
        Loader.hide();
        var loader = $('#inno-loader');
        assert.strictEqual(loader.css('display'), 'none');
        done();
    });
});
