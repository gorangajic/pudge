"use strict";

var Promise = require('bluebird');
var pudge = require('./index');
var sinon = require('sinon');
var assert = require('assert');
var store = require('store');
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
        Promise.join(
            pudge.run("PUDGE_IS_HERE"),
            pudge.run("COME_TO_PUDGE")
        ).then(function() {
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
                return Promise.delay(10).then(function() {
                    return "I_AM_HEAD";
                });
            });

            pudge.register('ROOT', 'leg', function() {
                return Promise.delay(10).then(function() {
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
                return Promise.delay(80);
            });
            pudge.register("FRESH_ROOT_MEAT", function() {
                return Promise.delay(80);
            });

            pudge.register("FRESH_ROOT_MEAT", function() {
                return Promise.delay(50);
            });

            pudge.register("FRESH_ROOT_MEAT", function() {
                return Promise.delay(76);
            });

            pudge.parallel("FRESH_ROOT_MEAT").then(function() {
                var endTime = Date.now();
                assert(endTime > startTime + 80, 'should be greater than 80ms');
                assert(endTime < startTime + 100, 'should be less than 100ms');
                done();
            }).catch(done);
        });
        it('should map the results', function(done) {
            pudge.register('ROOT', 'head', function() {
                return Promise.delay(10).then(function() {
                    return "I_AM_HEAD";
                });
            });

            pudge.register('ROOT', 'leg', function() {
                return Promise.delay(10).then(function() {
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

    describe('store', function() {
        beforeEach(function() {
            store.clear();
        });

        it('should add and get from store', function() {
            store.add('normal', 'FRESH_MEAT', 'something');
            var result = store.get('normal', 'FRESH_MEAT');
            assert(result == 'something');
        });
    });
});
