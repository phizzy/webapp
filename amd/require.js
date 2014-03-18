(function($) {

    "use strict";

    $.exports = $.exports || [];
    $.dependencies = $.dependencies || [];

    var step = {
        pending: {}
        ,done: {}
    };

    var callbacks = {
        urls: {}
        ,push: function(url, dependencies, cbk) {
            this.urls[url] = this.urls[url] || [];
            this.urls[url].push({
                dependencies: dependencies
                ,callback: window.lock(cbk)
            });
        }
        ,run: function(url) {
            this.urls[url] = this.urls[url] || [];
            this.urls[url].forEach(function(obj) {
                requireDependencies(obj.dependencies, obj.callback);
            });
            this.urls[url] = [];
        }
    };

    var requireString = function(string) {
        var url = getURL(string);
        if (step.done[url]) {
            return step.done[url].exports;
        }
    };

    var createScript = function(url) {
        var script = document.createElement('script');
        var afterLoaded= function() {
            var dependencies = $.dependencies.pop();
            var callMe = function() {
                step.done[url] = {
                    timestamp: (new Date()).getTime()
                    ,exports: $.exports.pop()
                };
                callbacks.run(url);
            };
            if (dependencies.length) {
                require(dependencies, callMe);
            }
            else {
                callMe();
            }
        };
        if (script.addEventListener) {
            script.addEventListener('load', afterLoaded);
        }
        else {
            var done = false;
            script.onreadystatechange = function() {
                if (!done && (!this.readyState || this.readyState==='loaded' || this.readyState==='complete')) {
                    done = true;
                    script.onreadystatechange = null;
                    afterLoaded();
                }
            };
        }
        script.src = url;
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(script);
    };

    var requireDependencies = function(dependencies, callback) {
        dependencies = (dependencies instanceof Array) ? dependencies : [dependencies];
        var needWait = false;
        dependencies.forEach(function(depend) {
            var url = window.getURL(depend);
            if (!step.pending[url]) {
                step.pending[url] = (new Date()).getTime();
                needWait = true;
                callbacks.push(url, dependencies, callback);
                createScript(url);
            }
            else if (!step.done[url]) {
                needWait = true;
                callbacks.push(url, dependencies, callback);
            }
        });
        if (!needWait) {
            var tmp = [];
            dependencies.forEach(function(depend) {
                tmp.push(step.done[getURL(depend)].exports);
            });
            callback.apply(null, tmp);
        }
    };
    // 页面UI线程调用
    var require = function() {
        /**
         * require(String): Synchronously returns the module export for the module ID represented by the String argument
         * require(Array, Function): The Array is an array of String module IDs. The modules that are represented by the module IDs should be retrieved and once all the modules for those module IDs are available, the Function callback is called, passing the modules in the same order as the their IDs in the Array argument.
         */
        return (arguments.length===1 && typeof arguments[0]==='string') ? requireString.call(null, arguments[0]) : requireDependencies.apply(null, arguments);
    };
    $.require = require;
})(window);
