/* global describe, it, chai, beforeEach, afterEach, IframeHelper, sinon */
var assert = chai.assert;

describe('PostMessenger', function () {

    var pm;

    describe('for listen event "message"', function () {

        it('should use addEventListener', function () {
            var addEventListener = window.addEventListener;
            window.addEventListener = window.addEventListener || function () {};
            sinon.spy(window, 'addEventListener');

            var attachEvent = window.attachEvent;
            window.attachEvent = window.attachEvent || function () {};
            sinon.spy(window, 'attachEvent');

            pm = new PostMessenger();
            assert.ok(window.addEventListener.calledOnce);
            assert.ok(window.addEventListener.calledWith('message'));
            assert.isNotOk(window.attachEvent.called);

            window.addEventListener = addEventListener;
            window.attachEvent = attachEvent;
        });

        it('should use attachEvent', function () {
            var addEventListener = window.addEventListener;
            window.addEventListener = null;

            var attachEvent = window.attachEvent;
            window.attachEvent = window.attachEvent || function () {};
            sinon.spy(window, 'attachEvent');

            pm = new PostMessenger();
            assert.ok(window.attachEvent.calledOnce);
            assert.ok(window.attachEvent.calledWith('onmessage'));

            window.addEventListener = addEventListener;
            window.attachEvent = attachEvent;
        });

    });

    describe('message handling', function () {

        beforeEach(function () {
            pm = new PostMessenger();
        });

        it('should return false if data is not JSON', function () {
            assert.strictEqual(pm.messageHandler(null), false);
            assert.strictEqual(pm.messageHandler('test'), false);
            assert.strictEqual(pm.messageHandler({data: 'not json'}), false);
        });

        it('should return false if no data.requestId', function () {
            assert.strictEqual(pm.messageHandler({data: JSON.stringify({})}), false);
        });

        it('should return false if no requestId in messageStack', function () {
            assert.strictEqual(pm.messageHandler({data: JSON.stringify({
                requestId: 'some id'
            })}), false);
        });

        it('should return false if no requestId in messageStack', function () {
            pm.messageStack['some id'] = 'not a function';
            assert.strictEqual(pm.messageHandler({data: JSON.stringify({
                requestId: 'some id'
            })}), false);
        });

        it('should return result from requestId function', function () {
            pm.messageStack['some id'] = function () {};
            sinon.stub(pm.messageStack, 'some id', function () {
                return 'myResult';
            });

            assert.strictEqual(pm.messageHandler({data: JSON.stringify({
                requestId: 'some id',
                success: 'success',
                message: 'my message'

            })}), 'myResult');

            assert.ok(pm.messageStack['some id'].calledWith('success', 'my message'));

        });
    });

    it('should generate uniq id', function () {
        var ids = {}, id,
            l = 1000;

        pm = new PostMessenger();

        while (l--) {
            id = pm.getUniqId();
            assert.isNotOk(id in ids);
            ids[id] = true;
        }
    });

    describe('message sending', function () {

        beforeEach(function () {
            pm = new PostMessenger();
        });

        it('should return false if data is not an object', function () {
            assert.strictEqual(pm.sendMessage(false), false);
            assert.strictEqual(pm.sendMessage('not object'), false);
            assert.strictEqual(pm.sendMessage(), false);
        });

        it('should return false if data can not be serialized', function () {
            sinon.stub(pm, 'send');
            assert.strictEqual(pm.sendMessage(window, function () {}), false);
        });

        it('should send data', function () {
            var data = {test: 1},
                callback = function () {};

            sinon.stub(pm, 'send', function () {
                return 'result';
            });

            assert.strictEqual(pm.sendMessage(data, null), 'result');
            assert.strictEqual(pm.sendMessage(data, callback), 'result');
            assert.ok('requestId' in data);
            assert.strictEqual(pm.messageStack[data.requestId], callback);
        });

    });

    describe('data sending', function () {

        beforeEach(function () {
            pm = new PostMessenger();
        });

        it('should throw error if no link to parent window', function () {
            var parent = window.parent;
            window.parent = null;
            assert.throws(function () {
                pm.send('some message');
            }, 'This page must be run in iframe.');
            window.parent = parent;
        });

        it('should throw error if not in iframe', function () {
            var top = window.top,
                self = window.self;

            window.self = window.top;

            assert.throws(function () {
                pm.send('some message');
            }, 'This page must be run in iframe.');

            window.top = top;
            window.self = self;
        });

        it('should send postMessage to parent', function () {
            var message = {my: 'message'};
            sinon.stub(window.parent, 'postMessage');

            pm.send(message);

            assert.ok(window.parent.postMessage.calledWith(message, '*'));
            window.parent.postMessage.restore();
        });

    });

});
