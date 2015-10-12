"use strict";

var store = {};

exports.get = function(type, key) {
    if (!store[type]) {
        store[type] = {};
    }

    return store[type][key] || [];
};

exports.add = function(type, key, val) {
    if (!store[type]) {
        store[type] = {};
    }
    if (!store[type][key]) {
        store[type][key] = [];
    }

    store[type][key].push(val);
};

exports.clear = function(name) {
    if (name) {
        store[name] = {};
    } else {
        store = {};
    }
};
