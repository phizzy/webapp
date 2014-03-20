define(function() {
    // #id
    // .classname
    // tagname
    var patterns = {
        id: {
            pt: /^\#([a-z0-9_\-]+)$/i
            ,check: function(value) {
                return this.id===value;
            }
        }
        ,classname: {
            pt: /^\.([a-z0-9_\-]+)$/i
            ,check: function(value) {
                var pt = new RegExp('(?:^|\s+)'+value+'(?:\s+|$)');
                return pt.test(this.className);
            }
        }
        ,tagname: {
            pt: /^([a-z0-9_\-]+)$/i
            ,check: function(value) {
                return this.tagName.toLowerCase()===value.toLowerCase();
            }
        }
    };

    var alias = {
        on: function(eventName, findStr, callback) {
            var icallback = function(evt) {
                var find = {}
                for (var i in patterns) {
                    if (patterns[i].pt.test(findStr)) {
                        find.type = i;
                        find.value = RegExp.$1;
                        break;
                    }
                };
                var target = evt.target;
                if (patterns[find.type].check.call(target, find.value)) {
                    callback.call(this, evt);
                }
            };
            return icallback;
        }
    };

    var chandler = {
        on: function() {
            var eventName, callback, filter;
            var isProxy = (arguments.length===3) ? true : false;
            if (this instanceof NodeList) {
                if (this.length>=1) {
                    var args = [];
                    Array.prototype.forEach.call(arguments, function(arg) {
                        args.push(arg);
                    });
                    Array.prototype.forEach.call(this, function(node) {
                        Element.prototype.on.apply(node, args);
                    });
                }
                return this;
            }
            eventName = arguments[0];
            if (isProxy) {
                callback = alias.on.apply(this, arguments);
                filter = arguments[1];
            }
            else {
                callback = arguments[1];
            }
            this.addEventListener(eventName, callback, false);

            return this;
        }
        ,off: function() {
            if (this instanceof NodeList) {
                if (this.length>=1) {
                    var args = [];
                    Array.prototype.forEach.call(arguments, function(arg) {
                        args.push(arg);
                    });
                    Array.prototype.forEach.call(this, function(node) {
                        Element.prototype.off.apply(node, args);
                    });
                }
                return this;
            }
            var eventName = arguments[0], filter, callback;
            var len = arguments.length;

            if (len===2 && typeof arguments[1]==='function') {
                this.removeEventListener(eventName, arguments[1], false);
            }

            return this;
        }
        ,addEventListener: function() {
            if (!(this instanceof NodeList)) return;
            for (var i=0,l=this.length; i<l; i++) {
                Element.prototype.addEventListener.apply(this[i], arguments);
            }
            return this;
        }
        ,removeEventListener: function() {
            if (!(this instanceof NodeList)) return;
            for (var i=0,l=this.length; i<l; i++) {
                Element.prototype.removeEventListener.apply(this[i], arguments);
            }
            return this;
        }
        ,appendChild: function() {
            if (!(this instanceof NodeList)) return;
            Element.prototype.appendChild.apply(this[0], arguments);
        }
    };

    var OBJs = [Element, NodeList, HTMLDocument];
    for (var i=0,l=OBJs.length; i<l; i++) {
        var tmp = OBJs[i];
        for (var j in chandler) {
            if (!tmp.prototype[j]) tmp.prototype[j] = chandler[j];
        }
    }

    function createElement(string) {
        var doc = document.createDocumentFragment();
        doc.appendChild(document.createElement('body'));
        query('body', doc).innerHTML = string;
        return query('body', doc);
    }

    function query(selector, parentElement) {
        if (selector.indexOf('<')===0) return createElement(selector);
        if (!parentElement) parentElement=document;
        var result = parentElement.querySelectorAll(selector);
        if (result.length==1) {
            result = result[0];
        }
        return result;
    };

    return query;
});
