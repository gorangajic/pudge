"use strict";

var Promise = require('bluebird');
var pudge = require('./index');
var sinon = require('sinon');
var assert = require('assert');

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
        pudge.register("FRESH_MEET", spy);
        pudge.before("FRESH_MEET", function() {
            sinon.assert.notCalled(spy);
            done();
        });

        pudge.run("FRESH_MEET").catch(done);
    });

    it('should call \'after handler\' after other handlers', function(done){
        var spy = sinon.spy();
        pudge.after("FRESH_MEET", function() {
            sinon.assert.calledOnce(spy);
            done();
        });
        pudge.register("FRESH_MEET", spy);

        pudge.run("FRESH_MEET").catch(done);
    });
});
