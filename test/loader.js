/*global describe, it, beforeEach, afterEach, chai,  $, InnoHelper */

var assert = chai.assert;

describe('Loader', function () {
    var inno;

    beforeEach(function () {
        inno = new InnoHelper();
    });

    afterEach(function () {
        inno.clean();
    });

    it('As default we use innometrics loader', function (done) {
        assert.ok(jQuery.contains(document, inno.utils.loader[0]));
        done();
    });

    it('showLoader/hideLoader should be show/hide loader', function (done) {
        var loader = inno.utils.loader;
        assert.ok(loader, 'Element exists');
        inno.showLoader();
        assert.strictEqual(loader.css('display'), 'block');
        inno.hideLoader();
        assert.strictEqual(loader.css('display'), 'none');
        done();
    });
});
