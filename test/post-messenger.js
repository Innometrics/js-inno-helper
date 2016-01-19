/* global describe, it, chai, before, beforeEach, window, afterEach, InnoHelper, sinon */
var assert = chai.assert;

describe('PostMessenger', function () {
    describe('for listen event "message"', function () {
        var addEventListener,
            attachEvent,
            inno,
            pm;

        beforeEach(function () {
            inno = new InnoHelper();
            pm = inno.pm;
        });

        before(function () {
            addEventListener = window.addEventListener;
            attachEvent = window.attachEvent;
        });

        afterEach(function () {
            inno.clean();
            window.addEventListener = addEventListener;
            window.attachEvent = attachEvent;
        });

        it('should use addEventListener', function () {
            window.addEventListener = window.addEventListener || function () {};
            sinon.spy(window, 'addEventListener');

            window.attachEvent = window.attachEvent || function () {};
            sinon.spy(window, 'attachEvent');

            inno.clean();
            inno = new InnoHelper();

            assert.ok(window.addEventListener.calledOnce);
            assert.ok(window.addEventListener.calledWith('message'));
            assert.isNotOk(window.attachEvent.called);
        });

        /* it('should use attachEvent', function () {
            window.addEventListener = undefined;

            window.attachEvent = function () {};
            sinon.stub(window, 'attachEvent');

            inno.clean();
            console.log(['Todo!',  window.name]);
            inno = new InnoHelper();
            assert.ok(window.attachEvent.calledOnce);
            assert.ok(window.attachEvent.calledWith('onmessage'));
        }); */

    });

    describe('message handling', function () {
        var inno,pm;

        beforeEach(function () {
            inno = new InnoHelper();
            pm = inno.pm;
        });

        afterEach(function () {
            inno.clean();
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

            assert.ok(pm.messageStack['some id'].calledWith(null, 'my message'));

        });
    });

    describe('message sending', function () {
        var inno,pm;

        beforeEach(function () {
            inno = new InnoHelper();
            pm = inno.pm;
        });

        afterEach(function () {
            inno.clean();
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
        var inno,pm;

        beforeEach(function () {
            inno = new InnoHelper();
            pm = inno.pm;
        });

        afterEach(function () {
            inno.clean();
        });

        it('should throw error if no link to parent window', function () {
            var parent = window.parent;
            window.parent = null;

            if (!window.parent) {
                assert.throws(function () {
                    pm.send('some message');
                }, 'This page must be run in iframe.');
            } else {
                assert.ok(true, 'This test can not be implemented in this browser');
            }


            window.parent = parent;
        });

        it('should throw error if not in iframe', function () {
            var top = window.top,
                self = window.self;

            window.self = 1;

            if (window.self === 1) {
                window.self = window.top;
                assert.throws(function () {
                    pm.send('some message');
                }, 'This page must be run in iframe.');
            } else {
                assert.ok(true, 'This test can not be implemented in this browser');
            }

            window.top = top;
            window.self = self;
        });

        it('should send postMessage to parent', function () {
            var parent = window.parent,
                spy = sinon.spy(),
                postMessage = parent.postMessage,
                message = {my: 'message'};

            parent.postMessage = spy;

            if (parent.postMessage !== postMessage) {
                pm.send(message);
                window.setTimeout(function () {
                    assert.ok(spy.calledWith(message, '*'));
                }, 100);
            } else {
                assert.ok(true, 'This test can not be implemented in this browser');
            }

            parent.postMessage = postMessage;
        });

    });

    describe('utils', function () {
        var inno,pm;

        beforeEach(function () {
            inno = new InnoHelper();
            pm = inno.pm;
        });

        afterEach(function () {
            inno.clean();
        });

        it('should generate uniq id', function () {
            var ids = {}, id,
                l = 1000;

            while (l--) {
                id = pm.getUniqId();
                assert.isNotOk(id in ids);
                ids[id] = true;
            }
        });

    });

});
