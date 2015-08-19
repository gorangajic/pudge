"use strict";

var Promise = require('bluebird');
var hooks = {};

module.exports.register = function(hookName, fn) {
    if (!hooks[hookName]) {
        hooks[hookName] = [];
    }
    hooks[hookName].push(fn);
};

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

