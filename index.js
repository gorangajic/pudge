"use strict";

var Promise = require('bluebird');
var hooks = {};

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

module.exports.run = function(hook) {
    var current = Promise.resolve();
    var args = Array.prototype.slice.call(arguments);

    // remove first argument
    args.shift();

    return Promise.all(hooks[hook].map(function(fn){
        current = current.then(function() {
            return fn.apply(this, args);
        });
        return current;
    }));
};

