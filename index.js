"use strict";

var Promise = require('bluebird');
var store = require('./store');

var NORMAL = 1;
var BEFORE = 2;
var AFTER = 3;

function addHook(type, name, fn) {
    if (Array.isArray(name)) {
        name.forEach(function(n) {
            addHook(type, n, fn);
        });
        return;
    }
    store.add(type, name, fn);
}

function register(name, fn) {
    addHook(NORMAL, name, fn);
}

exports.register = register;

function runHook(fns, args) {
    var current = Promise.resolve();
    if (!fns) {
        fns = [];
    }
    return Promise.all(fns.map(function(fn){
        current = current.then(function() {
            return fn.apply(this, args);
        });
        return current;
    }));
}

function runHookParallel(fns, args) {
    if (!fns) {
        fns = [];
    }
    return Promise.all(fns.map(function(fn){
        return fn.apply(this, args);
    }));
}

exports.run = function(name) {

    var args = Array.prototype.slice.call(arguments);

    // remove first argument
    args.shift();

    return runHook(store.get(BEFORE, name), args).then(function() {
        return runHook(store.get(NORMAL, name), args);
    }).then(function() {
        return runHook(store.get(AFTER, name), args);
    });
};

exports.parallel = function(name) {

    var args = Array.prototype.slice.call(arguments);

    // remove first argument
    args.shift();

    return runHookParallel(store.get(BEFORE, name), args).then(function() {
        return runHookParallel(store.get(NORMAL, name), args);
    }).then(function() {
        return runHookParallel(store.get(AFTER, name), args);
    });
};


exports.___clearHooks = function(name) {
    store.clear(name);
};

function before(name, fn) {
    addHook(BEFORE, name, fn);
}

exports.before = before;

function after(name, fn) {
    addHook(AFTER, name, fn);
}

exports.after = after;
