/* global describe, it, chai, beforeEach, afterEach, IframeHelper, sinon */
var assert = chai.assert;

var fixtures = {
    user: {
        login: 'john',
        real_name: 'John Doe',
        email: 'john.doe@somemail.com'
    },
    group: {
        codename: 'some-group-codename'
    },
    bucket: {
        codename: 'my-bucket',
        display_name: 'My bucket'
    },
    app: {
        codename: 'custom-app',
        display_name: 'Custom app',
        group: [{
            codename: 'activate',
            display_name: 'Share'
        }],
        type: 'custom',
        url: 'https://gentle-eyrie-8467.herokuapp.com/'
    },
    section: 'sec1',
    sections: ['sec1', 'sec2', 'sec3'],
    profileSchema: {
        id: 'profile',
        entries: {
            'sessions.android.mouse.data.data1': {
                origin: 'APP',
                accepted: true,
                modifiedAt: 1422010460676
            },
            'sessions.android.mouse.events.load': {
                origin: 'APP',
                accepted: true,
                modifiedAt: 1422010460676
            },
            'attributes.android.mouse.data.data1': {
                origin: 'APP',
                accepted: true,
                modifiedAt: 1422010460676
            },
            'sessions.android.mouse.events.load.data.data1': {
                origin: 'APP',
                accepted: true,
                modifiedAt: 1422010460676
            }
        }
    }
};

describe('inno helper', function () {
    var inno;
    beforeEach(function () {
        inno = new IframeHelper();
    });
    afterEach(function () {
        inno.pm.sendMessage.restore();
        inno = null;
    });

    it('should be ready for use', function (done) {
        sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
            return callback(true, fixtures);
        });
        inno.onReady(function () {
            done();
        });
    });

    it('can be get current data', function (done) {
        sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
            return callback(true, fixtures);
        });
        inno.onReady(function () {
            assert.deepEqual(inno.getCurrentUser(), fixtures.user, 'wrong user');
            assert.deepEqual(inno.getCurrentGroup(), fixtures.group, 'wrong group');
            assert.deepEqual(inno.getCurrentBucket(), fixtures.bucket, 'wrong bucket');
            assert.deepEqual(inno.getCurrentApp(), fixtures.app, 'wrong app');
            assert.deepEqual(inno.getCurrentSection(), fixtures.section, 'wrong section');
            assert.deepEqual(inno.getSections(), fixtures.sections, 'wrong sections');
            done();
        });
    });

    it('can be get profile schema session datas', function (done) {
        sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
            return callback(true, fixtures);
        });
        inno.onReady(function () {
            inno.pm.sendMessage.restore();
            sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
                return callback(true, fixtures.profileSchema);
            });
            inno.getProfileSchemaSessionDatas('android', 'mouse', function (data) {
                assert.deepEqual(data, ['data1'], 'wrong profile schema session datas');
                done();
            });
        });
    });

    it('can be get profile schema event definitions', function (done) {
        sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
            return callback(true, fixtures);
        });
        inno.onReady(function () {
            inno.pm.sendMessage.restore();
            sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
                return callback(true, fixtures.profileSchema);
            });
            inno.getProfileSchemaEventDefinitions(function (data) {
                assert.deepEqual(data, ['android/mouse/load'], 'wrong profile schema event definitions');
                done();
            });
        });
    });

    it('can be get profile schema attributes', function (done) {
        sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
            return callback(true, fixtures);
        });
        inno.onReady(function () {
            inno.pm.sendMessage.restore();
            sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
                return callback(true, fixtures.profileSchema);
            });
            inno.getProfileSchemaAttributes(function (data) {
                assert.deepEqual(data, ['android/mouse/data1'], 'wrong profile schema attributes');
                done();
            });
        });
    });

    it('can be get profile schema event definition datas', function (done) {
        sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
            return callback(true, fixtures);
        });
        inno.onReady(function () {
            inno.pm.sendMessage.restore();
            sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
                return callback(true, fixtures.profileSchema);
            });
            inno.getProfileSchemaEventDefinitionDatas('android', 'mouse', 'load', function (data) {
                assert.deepEqual(data, ['data1'], 'wrong profile schema event definition datas');
                done();
            });
        });
    });

    var methodsPart1 = ['getProperties', 'getWidgetSettings', 'removeProperties', 'getEventListeners', 'getRules', 'getSectionsFullList'];

    methodsPart1.map(function (item) {
        it('can be use ' + item, function (done) {
            sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
                return callback(true, fixtures);
            });
            inno[item](function (ok, data) {
                assert.strictEqual(ok, true);
                assert.strictEqual(typeof data, 'object');
                done();
            });
        });
    });

    var methodsPart2 = ['setProperties', 'setWidgetSettings', 'getProperty', 'removeProperty', 'removeEventListener', 'addEventListener', 'setRules', 'setRules', 'addLogMessage'];

    methodsPart2.map(function (item) {
        it('can be use ' + item, function (done) {
            sinon.stub(inno.pm, 'sendMessage', function (data, callback) {
                return callback(true, fixtures);
            });
            inno[item]('value', function (ok, data) {
                assert.strictEqual(ok, true);
                assert.strictEqual(typeof data, 'object');
                done();
            });
        });
    });
});
