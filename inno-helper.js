/* @version 0.0.1 */

/* global $, Request */
/* exported Loader */

var Loader = (function () {
    var spinner = null;
    var init = function () {
        $('body').append('<div id="inno-loader" style="display: none;"><div class="overlay"></div><div class="spinner"></div></div>');
        spinner = $('#inno-loader');
    };

    return {
        show: function () {
            if (!spinner) {
                init();
            }
            spinner.show();
        },
        hide: function () {
            if (spinner) {
                spinner.hide();
            }
        }
    };
})();


/* *
 * @class PostMessenger
 * Class for communicate with parent frame
 */
var PostMessenger = function () {
    var handler = this.messageHandler.bind(this);
    this.messageStack = {};
    if (window.addEventListener) {
        window.addEventListener('message', handler);
    } else {
        window.attachEvent('onmessage', handler);
    }
};

PostMessenger.prototype = {
    /* *
     * @param {String} message
     * @private
     * @return {Boolean} Status of sending message
     */
    messageHandler: function (message) {
        var data = {};
        try {
            data = JSON.parse(message.data);
        } catch (e) {
            return false;
        }

        if (!data.requestId || !this.messageStack[data.requestId] || !(this.messageStack[data.requestId] instanceof Function)) {
            return false;
        }

        return this.messageStack[data.requestId](data.success, data.message);
    },

    /* *
     * Generate uniq id for callbacks stack
     * @private
     * @return {String} Generated unique ID
     */
    getUniqId: (function () {
        window.performance = (
            (window.performance && window.performance.now) ?
            window.performance :
            {
                offset: Date.now(),
                now: function now(){
                    return Date.now() - this.offset;
                }
            }
        );

        return function () {
            return Math.round((+new Date() + window.performance.now()) * Math.random() * 1000);
        };
    })(),

    /* *
     * Adding callback to stack with uniq id and send message to parent frame
     * @param {Object} data
     * @param {Function} callback
     * @return {Boolean} Status of sending message
     */
    sendMessage: function (data, callback) {
        if (data instanceof Object) {
            var id = this.getUniqId();

            data.requestId = id;

            try {
                data = JSON.stringify(data);
            } catch (e) {
                return false;
            }

            if (callback instanceof Function) {
                this.messageStack[id] = callback;
            }

            return this.send(data);
        } else {
            return false;
        }
    },

    /* *
     * Send message to parent frame
     * @param {String} message
     * @private
     * @return {Boolean} Status of sending message
     */
    send: function (message) {
        if (window.parent && window.self !== window.top) {
            window.parent.postMessage(message, '*');
            return true;
        } else {
            throw new Error('This page must be run in iframe.');
        }
    }
};

/**
 * @class IframeHelper
 * Class provide methods for access to **GUI** data and **App Settings API**.
 *
 *     @example
 *     var iHelper = new IframeHelper();
 *
 *     iHelper.onReady(function () {
 *         iHelper.getProfileSchema(function (schema) {
 *             console.log('Schema: ', schema);
 *         });
 *     });
 *
 *     iHelper.getProperties(function (status, data) {
 *         console.log(status, 'Get properties: ', data);
 *     });
 *
 *     iHelper.getProperty('qwe', function (status, data) {
 *         console.log(status, 'Get "qwe" property: ', data);
 *     });
 *
 *     iHelper.setProperty('asd', 4444, function (status, data) {
 *         console.log(status, 'Set "asd" property: ', data);
 *     });
 *
 *     iHelper.getEventListeners(function (status, data) {
 *         console.log(status, 'Get event listeners', data);
 *     });
 *
 *     iHelper.addEventListener({
 *         "id": 123456789,
 *         "displayName": "Page view listener",
 *         "collectApp": "web",
 *         "section": "site",
 *         "definitionId": "page-view"
 *     }, function (status, data) {
 *         message(status, 'Add event listeners', data);
 *     });
 *
 */
var IframeHelper = function () {
    this.ready = false;
    this.readyStack = [];
    this.pm = new PostMessenger();

    this.currentData = null;
    this.profileSchemaData = null;

    setTimeout(this.loadCurrentData.bind(this), 0);
};

IframeHelper.prototype = {

    /**
     * Subscribe to "READY" event
     * @param {Function} callback
     */
    onReady: function (callback) {
        this.addReadyListener(callback);
    },

    /**
     * Add function to run after "READY" event
     * @private
     * @param {Function} callback
     */
    addReadyListener: function (callback) {
        if (this.ready) {
            callback();
        } else {
            this.readyStack.push(callback);
        }
    },

    /**
     * Run all subscribed functions for "READY" event
     * @private
     */
    dispatchReadyEvent: function () {
        this.ready = true;
        this.readyStack.forEach(function (fn) {
            if (fn instanceof Function) {
                fn();
            }
        });
    },

    /**
     * Request data from parent frame
     * @private
     * @param {String} codename
     * @param {Object} value (optional)
     * @param {Function} callback
     */
    request: function (codename, value, callback) {
        var data = {};
        if (arguments.length === 2 && value instanceof Function) {
            callback = value;
            value = null;
        }

        data.codename = codename;
        data.value = value;

        this.pm.sendMessage(data, callback);
    },

    /**
     * Load current data (user,group,bucket,app) from GUI
     * @private
     */
    loadCurrentData: function () {
        var self = this;
        this.request('gui.current.data', function (status, data) {
            if (!status) {
                throw new Error(data);
            } else {
                self.currentData = data;
                self.dispatchReadyEvent();
            }
        });
    },

    /**
     * Get current user data
     *
     * Example of returning **user** object:
     *
     *     @example
     *     {
     *         login: "john",
     *         real_name: "John Doe",
     *         email: "john.doe@somemail.com"
     *     }
     *
     * @return {Object} User data
     * @return {String} return.login Login of the user
     * @return {String} return.real_name Name of the user
     * @return {String} return.email Email of the user
     *
     */
    getCurrentUser: function () {
        return this.currentData.user;
    },

    /**
     * Get current group data
     *
     * Example of returning **group** object:
     *
     *     @example
     *     {
     *         codename: "some-group-codename"
     *     }
     *
     * @return {Object} Group data
     * @return {String} return.codename ID of the current group
     */
    getCurrentGroup: function () {
        return this.currentData.group;
    },

    /**
     * Get current bucket data
     *
     * Example of returning **bucket** object:
     *
     *     @example
     *     {
     *         codename: "my-bucket",
     *         display_name: "My bucket"
     *     }
     *
     * @return {Object} Bucket data:
     * @return {String} return.codename ID of the bucket
     * @return {String} return.display_name Visible name of the bucket
     */
    getCurrentBucket: function () {
        return this.currentData.bucket;
    },

    /**
     * Get current application data
     *
     * Example of returning **application** object:
     *
     *     @example
     *     {
     *         codename: "custom-app",
     *         display_name: "Custom app",
     *         group: [
     *             {
     *                  codename: "activate",
     *                  display_name: "Share"
     *             }
     *         ],
     *         type: "custom",
     *         url: "https://gentle-eyrie-8467.herokuapp.com/"
     *     }
     *
     * @return {Object} App data
     * @return {String} return.codename application ID
     * @return {String} return.display_name Name of the application
     * @return {Array}  return.group Category of the application
     * @return {String} return.group.codename Category codename
     * @return {String} return.group.display_name Visible name of category
     * @return {String} return.type Type of the application
     * @return {String} return.url Entry point of application backend
     */
    getCurrentApp: function () {
        return this.currentData.app;
    },

    /**
     * Returns selected section in current application
     * @return {Object} Section object
     * @return {String} return.codename ID of the section
     * @return {String} return.displayName Name of the section
     */
    getCurrentSection: function () {
        return this.currentData.section;
    },

    /**
     * Returns list of all available sections in current application
     * @return {Array} List of sections
     * @return {String} return.codename ID of the section
     * @return {String} return.displayName Name of the section
     */
    getSections: function () {
        return this.currentData.sections;
    },

    /**
     * Get all properties by current app
     * @param {Function} callback Callback function to be called to get result of the request
     * @param {Boolean} callback.status True if request succeed
     * @param {Object} callback.data List of properties in current application
     *
     * Example of **properties** object passed to callback:
     *
     *     @example
     *     {
     *         key1: "value1",
     *         key2: "value2"
     *     }
     *
     */
    getProperties: function (callback) {
        this.request('app.settings', callback);
    },

    /**
     * Set all properties by current app
     * @param {Object} values Key-value object with properties to set
     * @param {Function} callback Callback function to be called when request done
     * @param {Boolean} callback.status True if request succeed
     * @param {Object} callback.data List of properties in current application
     *
     * Example of **properties** object passed to callback:
     *
     *     @example
     *     {
     *         key1: "value1",
     *         key2: "value2"
     *     }
     *
     */
    setProperties: function (values, callback) {
        this.request('app.settings;update', values, callback);
    },

    /**
     * Set all widget settings by current widget
     * @param {Object} values Key-value object with widget settings to set
     * @param {Function} callback Callback function to be called when request done
     * @param {Boolean} callback.status True if request succeed
     * @param {Object} callback.data List of widget settings in current widget
     *
     * Example of **widget settings** object passed to callback:
     *
     *     @example
     *     {
     *         key1: "value1",
     *         key2: "value2"
     *     }
     *
     */
    setWidgetSettings: function (values, callback) {
        this.request('app.widget.settings;update', values, callback);
    },

    /**
     * Get all widget settings by current widget
     * @param {Function} callback Callback function to be called to get result of the request
     * @param {Boolean} callback.status True if request succeed
     * @param {Object} callback.data List of widget settings in current widget
     *
     * Example of **widget settings** object passed to callback:
     *
     *     @example
     *     {
     *         key1: "value1",
     *         key2: "value2"
     *     }
     *
     */
    getWidgetSettings: function (callback) {
        this.request('app.widget.settings', callback);
    },

    /**
     * Remove all properties in current app
     * @param {Function} callback Callback function to be called when request done
     * @param {Boolean} callback.status True if request succeed
     */
    removeProperties: function (callback) {
        this.request('app.settings;delete', callback);
    },

    /**
     * Get property by name
     * @param {String} property Name of the property to get
     * @param {Function} callback Callback function to be called to get result of the request
     * @param {Boolean} callback.status True if request succeed
     * @param {Object} callback.data Object containing requested value
     * @param {String} callback.data.property Key of property
     * @param {String} callback.data.value Value of property
     *
     * Example of **property** object passed to callback:
     *
     *     @example
     *     {
     *         property: "property-key",
     *         value: "property-value"
     *     }
     *
     */
    getProperty: function (property, callback) {
        this.request('app.property', {
            property: property
        }, callback);
    },

    /**
     * Set property by name
     * @param {String} property Name of the property to set
     * @param {Mixed} value Value of the property
     * @param {Function} callback Callback function to be called when request done
     * @param {Boolean} callback.status True if request succeed
     * @param {Object} callback.data Object containing set value
     * @param {String} callback.data.property Key of set property
     * @param {String} callback.data.value Value of set property
     *
     * Example of **property** object passed to callback:
     *
     *     @example
     *     {
     *         property: "property-key",
     *         value: "property-value"
     *     }
     *
`    */
    setProperty: function (property, value, callback) {
        if (property) {
            this.request('app.property;update', {
                property: property,
                value: value
            }, callback);
        } else {
            callback(false, 'Property is undefined');
        }
    },

    /**
     * Remove property by name
     * @param {String} property Name of the property to remove
     * @param {Function} callback Callback function to be called when request done
     * @param {Boolean} callback.status True if request succeed
     */
    removeProperty: function (property, callback) {
        if (property) {
            this.request('app.property;delete', property, callback);
        } else {
            callback(false, 'Property is undefined');
        }
    },

    /**
     * Get event listeners that subscribed by current app
     *
     * @param {Function} callback Callback function to be called when request done
     * @param {Boolean} callback.status True if request succeed
     * @param {Array} callback.data List of events on which current application is subscribed. Each element is JSON object representing event definition.
     *
     * Example of **event list** array:
     *
     *     @example
     *     [
     *          {
     *              id: "492",
     *              definitionId: "event-a",
     *              displayName: "Event A",
     *              section: "first-section"
     *              collectApp: "web",
     *          }
     *     ]
     */
    getEventListeners: function (callback) {
        this.request('app.event.listeners', callback);
    },

    /*
     * Remove event listener by codename
     * @param {String} codename Codename of event listener
     * @param {Function} callback
     */
    removeEventListener: function (codename, callback) {
        this.request('app.event.listener;delete', callback);
    },

    /*
     * Add event listener to app settings
     * @param {Object} event Codename of event listener
     * @param {Function} callback
     */
    addEventListener: function (event, callback) {
        this.request('app.event.listener;create', event, callback);
    },

    /**
     * Get profile schema from GUI
     * @param {String} codename Codename of event listener
     * @param {Function} callback
     *
     * Example of **profile schema** json:
     *
     *     @example
     *     {
     *         "id" : "profile",
     *         "entries" : {
     *             "sessions.ios.section.events.eventTemp1224" : {
     *                 "origin" : "APP",
     *                 "type" : "OBJECT",
     *                 "accepted" : true,
     *                 "modifiedAt" : 1409583214446
     *             },
     *             "sessions.ios.ios.events.eventTemp1429.data.eventTempTestKey1429" : {
     *                 "origin" : "APP",
     *                 "type" : "STRING",
     *                 "accepted" : true,
     *                 "modifiedAt" : 1409586477569
     *             },
     *             "sessions.ios.ios.events.eventTemp909.data.eventTempTestKey909" : {
     *                 "origin" : "APP",
     *                 "type" : "STRING",
     *                 "accepted" : true,
     *                 "modifiedAt" : 1409586477559
     *             }
     *         }
     *     }
     *
     */
    getProfileSchema: function (callback) {
        var self = this;
        if (this.profileSchemaData) {
            callback(true, this.profileSchemaData);
        } else {
            this.request('app.profile.schema', function (status, data) {
                self.profileSchemaData = data;
                callback(status, data);
            });
        }
    },

    /**
     * Get profile schema elements filtered by regexp
     * @param {String} regexp
     * @param {Function} callback
     * @returns {undefined}
     */
    getProfileSchemaElementsByRegexp: function (regexp, callback) {
        this.getProfileSchema(function (error, data) {
            var els = [];
            var entries, key, m;

            if (data && data.entries && data.entries instanceof Object) {
                entries = data.entries;
                for (key in entries) {
                    if (entries[key].accepted) {
                        m = key.match(regexp);
                        if (m) {
                            els.push(
                                m.slice(1).join('/')
                            );
                        }
                    }
                }
            }

            if (callback instanceof Function) {
                els.sort();
                callback(els);
            }
        });
    },

    /**
     * Get profile schema attributes
     * @param {Function} callback
     * @returns {undefined}
     */
    getProfileSchemaAttributes: function (callback) {
        var regexp = /^attributes\.([^.]+)\.([^.]+)\.data\.([^.]+)$/i;
        this.getProfileSchemaElementsByRegexp(regexp, callback);
    },

    /**
     * Get profile schema session datas
     * @param {String} appId
     * @param {String} sectionId
     * @param {Function} callback
     * @returns {undefined}
     */
    getProfileSchemaSessionDatas: function (appId, sectionId, callback) {
        var regStr = '^sessions.(' + appId + ').(' + sectionId + ').data.([^.]+)$';
        var regexp = new RegExp(regStr);
        this.getProfileSchemaElementsByRegexp(regexp, function (els) {
            if (callback instanceof Function) {
                els = els.map(function (el) {
                    var parts = el.split('/');
                    return parts[parts.length - 1];
                });

                callback(els);
            }
        });
    },

    /**
     * Get profile schema event definitions
     * @param {Function} callback
     * @returns {undefined}
     */
    getProfileSchemaEventDefinitions: function (callback) {
        var regexp = /^sessions\.([^.]+)\.([^.]+)\.events\.([^.]+)$/i;
        this.getProfileSchemaElementsByRegexp(regexp, callback);
    },

    /**
     * Get profile schema event definition datas
     * @param {String} appId
     * @param {String} sectionId
     * @param {String} eventId
     * @param {Function} callback
     * @returns {undefined}
     */
    getProfileSchemaEventDefinitionDatas: function (appId, sectionId, eventId, callback) {
        var regStr = '^sessions.(' + appId + ').(' + sectionId + ').events.(' + eventId + ').data.([^.]+)$';
        var regexp = new RegExp(regStr);
        this.getProfileSchemaElementsByRegexp(regexp, function (els) {
            if (callback instanceof Function) {
                els = els.map(function (el) {
                    var parts = el.split('/');
                    return parts[parts.length - 1];
                });

                callback(els);
            }
        });
    },

    /**
     * Get app rules
     * @param {Function} callback
     * @returns {undefined}
     */
    getRules: function (callback) {
        this.request('app.rules', callback);
    },

    /**
     * Set app rules
     * @param {Array} rules
     * @param {Function} callback
     * @returns {undefined}
     */
    setRules: function (rules, callback) {
        this.request('app.rules;set', rules, callback);
    },

    /**
     * Set app rules
     * @param {Array} rules
     * @param {Function} callback
     * @returns {undefined}
     */
    getSectionsFullList: function (callback) {
        this.request('gui.sections.full.list', callback);
    },

    /**
     * Add log message to GUI
     * @param {String} message
     * @param {Function} callback
     */

    addLogMessage: function (message, callback) {
        this.request('app.logs.message;create', message, callback);
    },

    /**
     * Add screen feedback message to GUI
     * @param {Object} type and message
     */

    addScreenMessage: function (message, type) {
        this.request('screen.message', {
            message: message,
            type: type
        });
    },

    /**
     * Send ready status to GUI
     */
    sendIsReady: function () {
        this.request('iframe.status;update');
    }
};

(function () {
    var getProxyUrlIfConnectionsIsUnsecure = function (url) {
        var proxy = document.referrer + (window.elyProxyUrlForCustomApps || "app_custom_proxy?url=");

        if (!url || !/^https?:/.test(url)) {
            url = window.location.origin + (url.charAt(0) === '/' ? url : '/' + url);
        } else if (window !== window.parent) { // is it iframe?
            url = (url && /^http:/.test(url)) ? proxy + encodeURIComponent(url) : url;
        }

        return url;
    };

    var xmlHttpRequestOverride = function () {
        XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (requestType, url) {
            url = getProxyUrlIfConnectionsIsUnsecure(url);
            return this._open.apply(this, arguments);
        };

        return XMLHttpRequest;
    };

    var fetchOverride = function () {
        if (window.fetch) {
            window._fetch = window.fetch;
            window.fetch = function (params) {
                if (window.Request && params instanceof Request) {
                    var url = getProxyUrlIfConnectionsIsUnsecure(params.url);

                    if (url !== params.url) {
                        params = new Request(
                            url, {
                                method: params.method,
                                headers: params.headers,
                                mode: params.mode
                            }
                        );
                    }
                } else if (params.toString && params.toString() === params) {
                    params = getProxyUrlIfConnectionsIsUnsecure(params);
                }

                return window._fetch.apply(null, arguments);
            };
        } else {
            return false;
        }
    };

    if (window.IS_DEVELOPMENT && window.location.protocol !== "https:") {
        xmlHttpRequestOverride();
        fetchOverride();
    }
})();
