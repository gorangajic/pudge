"use strict";

var Promise = require('bluebird');
var store = require('./store');
var extend = require('extend');
var NORMAL = 'NORMAL';
var BEFORE = 'BEFORE';
var AFTER = 'AFTER';

function addHook(type, name, key, fn) {
    var attach = function() {
        return addHook(type, name, key, fn);
    };

    if (typeof key === "function") {
        fn = key;
        key = undefined;
    }

    if (Array.isArray(name)) {
        name.forEach(function(n) {
            addHook(type, n, key, fn);
        });
    } else {
        store.add(type, name, {
            fn: fn,
            key: key
        });
    }

    return {
        key: key,
        run: fn,
        name: name,
        type: type,
        attach: attach
    };
}

exports.register = addHook.bind(this, NORMAL);

exports.before = addHook.bind(this, BEFORE);

exports.after = addHook.bind(this, AFTER);

function runHook(hooks, args) {
    var current = Promise.resolve();
    if (!hooks) {
        hooks = [];
    }
    var results = {};
    return Promise.all(hooks.map(function(hook){
        var fn = hook.fn;
        current = current.then(function() {
            return fn.apply(this, args);
        });
        return current.then(function(result) {
            if (hook.key) {
                results[hook.key] = result;
            }
            return result;
        });
    })).then(function() {
        return results;
    });
}

function runHookParallel(hooks, args) {
    if (!hooks) {
        hooks = [];
    }
    return Promise.all(hooks.map(function(hook){
        var fn = hook.fn;
        return fn.apply(this, args);
    })).then(function(results) {
        var props = {};
        results.forEach(function(result, index) {
            var key = hooks[index].key;
            if (key) {
                props[key] = result;
            }
        });
        return props;
    });
}

exports.run = function(name) {
    var result = {};
    var args = Array.prototype.slice.call(arguments);

    // remove first argument
    args.shift();

    return runHook(store.get(BEFORE, name), args).then(function(beforeResult) {
        result = extend(result, beforeResult);
        return runHook(store.get(NORMAL, name), args);
    }).then(function(normalResult) {
        result = extend(result, normalResult);
        return runHook(store.get(AFTER, name), args);
    }).then(function(afterResult) {
        result = extend(result, afterResult);
        return result;
    });
};

exports.parallel = function(name) {
    var result = {};
    var args = Array.prototype.slice.call(arguments);

    // remove first argument
    args.shift();

    return runHookParallel(store.get(BEFORE, name), args).then(function(beforeResult) {
        result = extend(result, beforeResult);
        return runHookParallel(store.get(NORMAL, name), args);
    }).then(function(normalResult) {
        result = extend(result, normalResult);
        return runHookParallel(store.get(AFTER, name), args);
    }).then(function(afterResult) {
        result = extend(result, afterResult);
        return result;
    });
};


exports.clear = exports.___clearHooks = function(name) {
    store.clear(name);
};
