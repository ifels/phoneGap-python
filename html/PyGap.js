var TAG="platform.js----> :";

if (typeof PyGap === "undefined") {
    console.log(TAG+'define PyGap');

    var PyGap = {
    };

    PyGap.callbackId = 0;
    PyGap.callbacks = {};
    PyGap.callbackStatus = {
        NO_RESULT: 0,
        OK: 1,
        CLASS_NOT_FOUND_EXCEPTION: 2,
        ILLEGAL_ACCESS_EXCEPTION: 3,
        INSTANTIATION_EXCEPTION: 4,
        MALFORMED_URL_EXCEPTION: 5,
        IO_EXCEPTION: 6,
        INVALID_ACTION: 7,
        JSON_EXCEPTION: 8,
        ERROR: 9
        };


    /**
     * Execute a PyGap command.  It is up to the native side whether this action is synch or async.
     * The native side can return:
     *      Synchronous: PluginResult object as a JSON string
     *      Asynchrounous: Empty string ""
     * If async, the native side will PyGap.callbackSuccess or PyGap.callbackError,
     * depending upon the result of the action.
     *
     * @param {Function} success    The success callback
     * @param {Function} fail       The fail callback
     * @param {String} service      The name of the service to use
     * @param {String} action       Action to be run in PyGap
     * @param {Array.<String>} [args]     Zero or more arguments to pass to the method
     */
    PyGap.exec = function(success, fail, service, action, args) {
        try {
            var callbackId = service + PyGap.callbackId++;
            if (success || fail) {
                PyGap.callbacks[callbackId] = {success:success, fail:fail};
            }

            var r = prompt(PyGap.stringify(args), "uv:"+PyGap.stringify([service, action, callbackId, true]));

            console.log(TAG+'result: '+r)
            // If a result was returned
            if (r.length > 0) {
                console.log(TAG+'r.length: '+r.length)
                eval("var v="+r+";");
                console.log(TAG+'status: '+v.status)
                // If status is OK, then return value back to caller
                if (v.status === PyGap.callbackStatus.OK) {

                    // If there is a success callback, then call it now with
                    // returned value
                    if (success) {
                        try {
                            success(v.message);
                        } catch (e) {
                            console.log(TAG+"Error in success callback: " + callbackId  + " = " + e);
                        }

                        // Clear callback if not expecting any more results
                        if (!v.keepCallback) {
                            delete PyGap.callbacks[callbackId];
                        }
                    }
                    return v.message;
                }

                // If no result
                else if (v.status === PyGap.callbackStatus.NO_RESULT) {

                    // Clear callback if not expecting any more results
                    if (!v.keepCallback) {
                        delete PyGap.callbacks[callbackId];
                    }
                }

                // If error, then display error
                else {
                    console.log(TAG+"Error: Status="+v.status+" Message="+v.message);

                    // If there is a fail callback, then call it now with returned value
                    if (fail) {
                        try {
                            fail(v.message);
                        }
                        catch (e1) {
                            console.log(TAG+"Error in error callback: "+callbackId+" = "+e1);
                        }

                        // Clear callback if not expecting any more results
                        if (!v.keepCallback) {
                            delete PyGap.callbacks[callbackId];
                        }
                    }
                    return null;
                }
            }
        } catch (e2) {
            console.log(TAG+"+++Error: "+e2);
        }
    };

    /**
     * Called by native code when returning successful result from an action.
     *
     * @param callbackId
     * @param args
     */
    PyGap.callbackSuccess = function(callbackId, args) {
        if (PyGap.callbacks[callbackId]) {

            // If result is to be sent to callback
            if (args.status === PyGap.callbackStatus.OK) {
                try {
                    if (PyGap.callbacks[callbackId].success) {
                        PyGap.callbacks[callbackId].success(args.message);
                    }
                }
                catch (e) {
                    console.log(TAG+"Error in success callback: "+callbackId+" = "+e);
                }
            }

            // Clear callback if not expecting any more results
            if (!args.keepCallback) {
                delete PyGap.callbacks[callbackId];
            }
        }
    };

    /**
     * Called by native code when returning error result from an action.
     *
     * @param callbackId
     * @param args
     */
    PyGap.callbackError = function(callbackId, args) {
        if (PyGap.callbacks[callbackId]) {
            try {
                if (PyGap.callbacks[callbackId].fail) {
                    PyGap.callbacks[callbackId].fail(args.message);
                }
            }
            catch (e) {
                console.log(TAG+"Error in error callback: "+callbackId+" = "+e);
            }

            // Clear callback if not expecting any more results
            if (!args.keepCallback) {
                delete PyGap.callbacks[callbackId];
            }
        }
    };

    /**
     * If JSON not included, use our own stringify. (Android 1.6)
     * The restriction on ours is that it must be an array of simple types.
     *
     * @param args
     * @return {String}
     */
    PyGap.stringify = function(args) {
        if (typeof JSON === "undefined") {
            var s = "[";
            var i, type, start, name, nameType, a;
            for (i = 0; i < args.length; i++) {
                if (args[i] !== null) {
                    if (i > 0) {
                        s = s + ",";
                    }
                    type = typeof args[i];
                    if ((type === "number") || (type === "boolean")) {
                        s = s + args[i];
                    } else if (args[i] instanceof Array) {
                        s = s + "[" + args[i] + "]";
                    } else if (args[i] instanceof Object) {
                        start = true;
                        s = s + '{';
                        for (name in args[i]) {
                            if (args[i][name] !== null) {
                                if (!start) {
                                    s = s + ',';
                                }
                                s = s + '"' + name + '":';
                                nameType = typeof args[i][name];
                                if ((nameType === "number") || (nameType === "boolean")) {
                                    s = s + args[i][name];
                                } else if ((typeof args[i][name]) === 'function') {
                                    // don't copy the functions
                                    s = s + '""';
                                } else if (args[i][name] instanceof Object) {
                                    s = s + PyGap.stringify(args[i][name]);
                                } else {
                                    s = s + '"' + args[i][name] + '"';
                                }
                                start = false;
                            }
                        }
                        s = s + '}';
                    } else {
                        a = args[i].replace(/\\/g, '\\\\');
                        a = a.replace(/"/g, '\\"');
                        s = s + '"' + a + '"';
                    }
                }
            }
            s = s + "]";
            return s;
        } else {
            return JSON.stringify(args);
        }
    };
}
prompt("", "uv_init:");

