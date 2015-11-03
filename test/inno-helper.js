/* global describe, it, chai, beforeEach, afterEach, IframeHelper, sinon */

describe('inno helper', function () {
    var assert = chai.assert;

    var inno;
    beforeEach(function () {
        inno = new IframeHelper();
    });
    afterEach(function () {
        inno = null;
    });

    it('will be ready', function (done) {
        sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
            return callback(true, data);
        });
        inno.onReady(function () {
            inno.pm.sendMessage.restore();
            done();
        });
    });
});
