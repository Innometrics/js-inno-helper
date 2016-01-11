/*global describe, beforeEach, it, chai, Loader, $, window */

var assert = chai.assert;

describe('Loader', function () {

    it('should be defined', function () {
        assert('Loader' in window);
    });

    it('should not breaks code', function (done) {
        var loader;

        assert.doesNotThrow(function () {
            Loader.hide();
        }, 'function does not throw');

        loader = $('#inno-loader');
        assert.strictEqual(loader.length, 0);

        done();
    });

    it('should be showen', function (done) {
        var loader;
        Loader.show();
        loader = $('#inno-loader');
        assert.ok(loader);
        assert.strictEqual(loader.css('display'), 'block');
        done();
    });

    it('should be hidden', function (done) {
        Loader.show();
        Loader.hide();
        var loader = $('#inno-loader');
        assert.strictEqual(loader.css('display'), 'none');
        done();
    });

});
