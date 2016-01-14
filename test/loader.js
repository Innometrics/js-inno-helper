/*global describe, it,  chai,  $, InnoHelper */

var assert = chai.assert;

describe('Loader', function () {
    var inno = new InnoHelper();

    it('As default we use innometrics loader', function (done) {
        var loader = $('#inno-loader');
        assert.ok(loader.length === 1);
        done();
    });

    it('showLoader/hideLoader should be show/hide loader', function (done) {
        var loader = $('#inno-loader');
        assert.ok(loader, 'Element exists');
        inno.showLoader();
        assert.strictEqual(loader.css('display'), 'block');
        inno.hideLoader();
        assert.strictEqual(loader.css('display'), 'none');
        done();
    });
});
