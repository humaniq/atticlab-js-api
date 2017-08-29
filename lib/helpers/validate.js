/* * Copyright 2017 Atticlab LLC.
 * Licensed under the Apache License, Version 2.0
 * See the LICENSE or LICENSE_UA file at the root of this repository
 * Contact us at http://atticlab.net
 */
const _ = require('lodash');
const nacl = require('tweetnacl');
const errors = require('./errors');

module.exports = {
  present: function(prop) {
    return function(data) {
      if (typeof data[prop] != 'number' && _.isEmpty(data[prop])) {
        return Promise.reject(new errors.MissingField(prop));
      } else {
        return Promise.resolve(data);
      }
    };
  },

  memolength: function(prop) {
    return function(data) {
      if (typeof data != 'undefined' && typeof data[prop] != 'undefined' &&
          data[prop].length > 255) {
        return Promise.reject(new errors.InvalidField(prop));
      } else {
        return Promise.resolve(data);
      }
    };
  },

  number: function(prop, optional) {
    return function(data) {

      if (optional &&
          (typeof data == 'undefined' || typeof data[prop] == 'undefined')) {
        return Promise.resolve(data);
      }

      if (!_.isNumber(data[prop])) {
        return Promise.reject(new errors.InvalidField(prop));
      } else {
        return Promise.resolve(data);
      }
    };
  },

  bool: function(prop, optional) {
    return function(data) {
      if (optional &&
          (typeof data == 'undefined' || typeof data[prop] == 'undefined')) {
        return Promise.resolve(data);
      }
      if (typeof(data[prop]) !== "boolean") {
        return Promise.reject(new errors.InvalidField(prop));
      } else {
        return Promise.resolve(data);
      }
    };
  },

  array: function(prop, optional) {
    return function(data) {
      if (optional &&
          (typeof data == 'undefined' || typeof data[prop] == 'undefined')) {
        return Promise.resolve(data);
      }

      if (!Array.isArray(data[prop])) {
        return Promise.reject(new errors.InvalidField(prop));
      } else {
        return Promise.resolve(data);
      }
    };
  },

  string: function(prop, optional) {
    return function(data) {

      if (optional &&
          (typeof data == 'undefined' || typeof data[prop] == 'undefined')) {
        return Promise.resolve(data);
      }

      if (!_.isString(data[prop])) {
        return Promise.reject(new errors.InvalidField(prop));
      } else {
        return Promise.resolve(data);
      }
    };
  },

  keyPair: function(prop) {
    return function(data) {
      var keyPair = _.clone(data[prop]);
      keyPair.publicKey = nacl.util.decodeBase64(keyPair.publicKey);
      keyPair.secretKey = nacl.util.decodeBase64(keyPair.secretKey);

      var keyPairFromSecret = nacl.sign.keyPair.fromSecretKey(
          keyPair.secretKey);

      if (!nacl.verify(keyPair.publicKey, keyPairFromSecret.publicKey)) {
        return Promise.reject(new errors.InvalidField(prop));
      } else {
        return Promise.resolve(data);
      }
    };
  },

  email: function(prop, optional) {
    return function(data) {

      if (optional &&
          (typeof data == 'undefined' || typeof data[prop] == 'undefined')) {
        return Promise.resolve(data);
      }

      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test(data[prop])) {
        return Promise.reject(new errors.InvalidField(prop));
      } else {
        return Promise.resolve(data);
      }
    };
  },
};