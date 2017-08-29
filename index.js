/* * Copyright 2017 Atticlab LLC.
 * Licensed under the Apache License, Version 2.0
 * See the LICENSE or LICENSE_UA file at the root of this repository
 * Contact us at http://atticlab.net
 */
const errors = require('./lib/helpers/errors.js');
const axios = require('axios');
const admins = require('./lib/api/admins.js');
const agents = require('./lib/api/agents.js');
const companies = require('./lib/api/companies.js');
const enrollments = require('./lib/api/enrollments.js');
const invoices = require('./lib/api/invoices.js');
const bonuses = require('./lib/api/bonuses.js');
const logs = require('./lib/api/logs.js');
const qs = require('qs');
const nacl = require('tweetnacl');
const EventEmitter = require('events').EventEmitter;

class SmartApi extends EventEmitter {
    constructor(options) {
        super();

        var self = this;

        this.options = Object.assign({}, {
            // Ttl for api requests
            request_ttl: 30,

            // Set this to false to send requests via formdata and not raw json
            sendRaw: false
        }, options);

        this.axios;
        this.nonce;
        this.ttlExpiration = 0;
        this.keypair;

        this.initAxios();

        setInterval(function () {
            var expires = self.ttlExpiration - Math.floor(Date.now() / 1000);

            if (self.nonce && expires <= 0) {
                self.nonce = null;
            }

            self.emit('tick', expires < 0 ? 0 : expires);
        }, 1000);
    }

    initAxios() {
        var self = this;

        self.axios = axios.create();
        self.axios.defaults.baseURL = this.options.host.replace(/\/+$/g, '');
        self.axios.defaults.timeout = this.options.request_ttl * 1000;

        // Update nonce on return
        self.axios.interceptors.response.use(function (response) {
            if (response.data.nonce) {
                self.nonce = response.data.nonce;
                self.ttlExpiration = Math.floor(Date.now() / 1000) + response.data.ttl;
            } else {
                // If nonce didn't arrive - let's clear it
                self.nonce = false;
            }

            return response.data;
        }, function (error) {
            self.nonce = null;
            if (error.response && error.response.data) {
                return Promise.reject(errors.getProtocolError(error.response.data.error, error.response.data.message || ''));
            }

            return Promise.reject(new errors.ConnectionError());
        });

        // Sign request before send
        self.axios.interceptors.request.use(function (config) {
            if (!self.options.sendRaw) {
                config.data = qs.stringify(config.data)
            }

            if (self.nonce && self.keypair) {
                let route = config.url.replace(/^(https?:)?(\/{2})?.*?(?=\/)/, '');

                // For get parameter we need to add data to query
                if (typeof config.params == 'object' && Object.keys(config.params).length) {
                    route += (route.indexOf('?') === -1 ? '?' : '&') + qs.stringify(config.params, {
                            encode: false,
                            arrayFormat: 'brackets'
                        });
                }

                //for reverting spaces to pluses (uri format)
                route = route.split(' ').join('+');

                var request_data = typeof config.data == 'object' ? JSON.stringify(config.data) : '';
                var data = route + request_data + self.nonce;
                var pair = nacl.sign.keyPair.fromSeed(self.keypair.rawSecretKey());
                
                config.headers['Signature'] = [
                    self.nonce,
                    nacl.util.encodeBase64(nacl.sign.detached(nacl.util.decodeUTF8(data), pair.secretKey)),
                    self.keypair.rawPublicKey().toString('base64')
                ].join(':');
            }

            return config;
        });
    }

    /**
     * Set account keypair for signing requests
     * @param account_id
     */
    setKeypair(keypair) {
        if (typeof keypair == 'undefined' || typeof keypair.publicKey != 'function' || typeof keypair.secret != 'function') {
            throw new errors.InvalidField('keypair');
        }

        this.nonce = null;
        this.keypair = keypair;
    }

    refreshNonce() {
        return this.axios.get('/nonce', {
            params: {
                accountId: this.keypair.publicKey()
            }
        })
    }

    getNonce(params) {
        if (this.nonce) {
            return Promise.resolve(params)
        }

        if (!this.keypair) {
            return Promise.reject(new errors.InvalidField('keypair', 'Please use setKeypair(YOUR_KEYPAIR) to work with api'));
        }

        return this.axios.get('/nonce', {
                params: {
                    accountId: this.keypair.publicKey()
                }
            })
            .then(function () {
                return params;
            });
    }
}

/**
 * Api object factory
 */
module.exports = class {
    constructor(options) {
        this.Api = new SmartApi(options);

        this.Admins = new admins(this.Api);
        this.Agents = new agents(this.Api);
        this.Companies = new companies(this.Api);
        this.Enrollments = new enrollments(this.Api);
        this.Invoices = new invoices(this.Api);
        this.Bonuses = new bonuses(this.Api);
        this.Logs = new logs(this.Api);
    }

    setKeypair(key) {
        this.Api.setKeypair(key);
    }
}
