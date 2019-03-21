"use strict";
var pudge = require('./index');
var sinon = require('sinon');
var assert = require('assert');
var store = require('./store');

function delay(ms) {
    return new Promise(function(resolve){
        setTimeout(resolve, ms);
    });
}

describe('Pudge', function() {
    beforeEach(function() {
        pudge.___clearHooks();
    });

    it('should save and call hook', function(done) {
        var spy = sinon.spy();
        pudge.register("FRESH_MEET", spy);
        pudge.run("FRESH_MEET", 1, 2, 3).then(function() {
            assert(spy.called, "should be called");
            done();
        });
    });

    it('should call one after another', function(done) {
        var called = false;
        pudge.register("GET_OVER_HERE", function() {
            called = true;
        });
        pudge.register("GET_OVER_HERE", function() {
            assert(called, 'should be called after');
            done();
        });
        pudge.run("GET_OVER_HERE");
    });

    it('should be called with provided params', function(done) {
        var spy = sinon.spy();
        pudge.register("NJAM_NJAM", spy);
        pudge.run("NJAM_NJAM", 1, 2, 3).then(function() {
            assert(spy.calledWith(1, 2, 3), "should be called with 1, 2, 3");
            done();
        });
    });

    it('can register more than one listener', function(done) {
        var spy = sinon.spy();
        pudge.register(["PUDGE_IS_HERE", "COME_TO_PUDGE"], spy);
        Promise.all([
            pudge.run("PUDGE_IS_HERE"),
            pudge.run("COME_TO_PUDGE")
        ]).then(function() {
            assert(spy.calledTwice, 'should be called twice');
            done();
        });
    });

    it('should call \'before handler\' before other handlers', function(done){
        var spy = sinon.spy();
        pudge.register("FRESH_MEAT", spy);
        pudge.before("FRESH_MEAT", function() {
            sinon.assert.notCalled(spy);
            done();
        });

        pudge.run("FRESH_MEAT").catch(done);
    });

    it('should call \'after handler\' after other handlers', function(done){
        var spy = sinon.spy();
        pudge.after("FRESH_MEAT", function() {
            sinon.assert.calledOnce(spy);
            done();
        });
        pudge.register("FRESH_MEAT", spy);

        pudge.run("FRESH_MEAT").catch(done);
    });

    it('should map the results', function() {
        it('should map the results', function(done) {
            pudge.register('ROOT', 'head', function() {
                return delay(10).then(function() {
                    return "I_AM_HEAD";
                });
            });

            pudge.register('ROOT', 'leg', function() {
                return delay(10).then(function() {
                    return "I_AM_LEG";
                });
            });

            pudge.run('ROOT').then(function(results) {
                assert(results.leg === "I_AM_LEG");
                assert(results.head === "I_AM_HEAD");
                done();
            }).catch(done);
        });
    });

    describe('parallel', function() {
        it('should run tasks in parallel', function(done) {
            var startTime = Date.now();
            pudge.register("FRESH_ROOT_MEAT", function() {
                return delay(80);
            });
            pudge.register("FRESH_ROOT_MEAT", function() {
                return delay(80);
            });

            pudge.register("FRESH_ROOT_MEAT", function() {
                return delay(50);
            });

            pudge.register("FRESH_ROOT_MEAT", function() {
                return delay(76);
            });

            pudge.parallel("FRESH_ROOT_MEAT").then(function() {
                var endTime = Date.now();
                var diff = endTime - startTime;
                assert(endTime >= startTime + 80, 'should be greater than 80ms -> ' + diff);
                assert(endTime < startTime + 100, 'should be less than 100ms -> ' + diff);
                done();
            }).catch(done);
        });
        it('should map the results', function(done) {
            pudge.register('ROOT', 'head', function() {
                return delay(10).then(function() {
                    return "I_AM_HEAD";
                });
            });

            pudge.register('ROOT', 'leg', function() {
                return delay(10).then(function() {
                    return "I_AM_LEG";
                });
            });

            pudge.parallel('ROOT').then(function(results) {
                assert(results.leg === "I_AM_LEG");
                assert(results.head === "I_AM_HEAD");
                done();
            }).catch(done);
        });
    });


    describe('metadata', function() {
        it('should register and return without key', function() {
            var awesomeFn = function() {};
            var meta = pudge.register('OLA', awesomeFn);
            assert(meta.run === awesomeFn, 'run should be passed back');
            assert(meta.key === undefined, 'key should be undefined');
            assert(meta.name === "OLA", 'name should be defined');
        });

        it('should register and return with key', function() {
            var awesomeFn = function() {};
            var meta = pudge.register('OLA', 'name', awesomeFn);
            assert(meta.run === awesomeFn, 'run should be passed back');
            assert(meta.key === 'name', 'key should be undefined');
            assert(meta.name === "OLA", 'name should be defined');
        });

        it('should return NORMAL type for register', function() {
            var awesomeFn = function() {};
            var meta = pudge.register('OLA', 'name', awesomeFn);
            assert(meta.type === "NORMAL");
        });
        it('should return BEFORE type for before', function() {
            var awesomeFn = function() {};
            var meta = pudge.before('OLA', 'name', awesomeFn);
            assert(meta.type === "BEFORE");
        });

        it('should return AFTER type for after', function() {
            var awesomeFn = function() {};
            var meta = pudge.after('OLA', 'name', awesomeFn);
            assert(meta.type === "AFTER");
        });
    });

    describe('store', function() {
        beforeEach(function() {
            store.clear();
        });

        it('should add and get from store', function() {
            store.add('normal', 'FRESH_MEAT', 'something');
            var result = store.get('normal', 'FRESH_MEAT');
            assert(result[0] === 'something');
        });
    });

    it('should attach it\'self after being cleared', function(done) {
        var hook = pudge.register('EAT_SOMETHING', function(result) {
            assert(result === 'ok');
            done();
        });
        store.clear();
        assert(store.get('NORMAL', 'EAT_SOMETHING').length === 0, 'have length of 0');
        hook.attach();
        assert(store.get('NORMAL', 'EAT_SOMETHING').length === 1, 'have length of 1');

        pudge.run('EAT_SOMETHING', 'ok');
    });
});
