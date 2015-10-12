"use strict";

var Promise = require('bluebird');
var hooks = {};
var beforeHooks = {};
var afterHooks = {};

function register(hookName, fn) {
    if (Array.isArray(hookName)) {
        hookName.forEach(function(hook) {
            register(hook, fn);
        });
        return;
    }
    if (!hooks[hookName]) {
        hooks[hookName] = [];
    }
    hooks[hookName].push(fn);
}

module.exports.register = register;

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

module.exports.run = function(hook) {

    var args = Array.prototype.slice.call(arguments);

    // remove first argument
    args.shift();

    return runHook(beforeHooks[hook], args).then(function() {
        return runHook(hooks[hook], args);
    }).then(function() {
        return runHook(afterHooks[hook], args);
    });
};

module.exports.parallel = function(hook) {

    var args = Array.prototype.slice.call(arguments);

    // remove first argument
    args.shift();

    return runHookParallel(beforeHooks[hook], args).then(function() {
        return runHookParallel(hooks[hook], args);
    }).then(function() {
        return runHookParallel(afterHooks[hook], args);
    });
};


module.exports.___clearHooks = function(hookName) {
    if (typeof hookName !== "undefined") {
        hooks[hookName] = [];
        beforeHooks[hookName] = [];
        afterHooks[hookName] = [];
        return true;
    }
    hooks = {};
    beforeHooks = {};
    afterHooks = {};

};

function before(hookName, fn) {
    if (Array.isArray(hookName)) {
        hookName.forEach(function(hook) {
            before(hook, fn);
        });
        return;
    }
    if (!beforeHooks[hookName]) {
        beforeHooks[hookName] = [];
    }
    beforeHooks[hookName].push(fn);
}

module.exports.before = before;

function after(hookName, fn) {
    if (Array.isArray(hookName)) {
        hookName.forEach(function(hook) {
            after(hook, fn);
        });
        return;
    }
    if (!afterHooks[hookName]) {
        afterHooks[hookName] = [];
    }
    afterHooks[hookName].push(fn);
}

module.exports.after = after;
