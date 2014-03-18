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

    var bindedElements = {};

    var defaultSuffix = 'page'
        ,allSuffix = 'all';
    
    var evtPtn = /([a-z]+)\.([a-z]+)/;
    var chandler = {
        on: function(eventName, callback) {
            if (arguments.length==3) {
                callback = alias.on.apply(this, arguments);
            }
            if (evtPtn.test(eventName)) {
                eventName = RegExp.$1;
                callback.eventSuffix = RegExp.$2;
            }
            else {
                callback.eventSuffix = defaultSuffix;
            }
            this.addEventListener(eventName, callback, false);
            if (!this.callbacks || !(this.callbacks instanceof Array)) {
                this.callbacks = [];
            }
            this.callbacks.push(callback);

            bindedElements[this.queryString] = bindedElements[this.queryString] || [];
            var iEventName = eventName + '.' + callback.eventSuffix;
            if (bindedElements[this.queryString].indexOf(iEventName)===-1) {
                bindedElements[this.queryString].push(iEventName);
            }

            console.log(bindedElements);

            return this;
        }
        ,off: function(eventName, callback) {
            var len = arguments.length;
            if (len==2) {
                this.removeEventListener(eventName, callback, false);
            }
            else if (len==1 && this.callbacks && this.callbacks instanceof Array && this.callbacks.length) {
                var suffix, mj=[];
                if (evtPtn.test(eventName)) {
                    eventName = RegExp.$1;
                    suffix = RegExp.$2;
                }
                else {
                    suffix = defaultSuffix;
                }
                for (var i=0,l=this.callbacks.length; i<l; i++) {
                    if (suffix===allSuffix || this.callbacks[i].eventSuffix==suffix) {
                        this.off(eventName, this.callbacks[i]);
                        mj.push(i);
                    }
                }
                var tmpCount = 0;
                for (var i=0,l=mj.length; i<l; i++) {
                    this.callbacks = this.callbacks.slice(i-tmpCount++);
                }

                if (!this.callbacks.length) {
                    delete bindedElements[this.queryString];
                }
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
    };

    var OBJs = [Element, NodeList, HTMLDocument];
    for (var i=0,l=OBJs.length; i<l; i++) {
        var tmp = OBJs[i];
        for (var j in chandler) {
            if (!tmp.prototype[j]) tmp.prototype[j] = chandler[j];
        }
    }

    function query(selector, parentElement) {
        if (!parentElement) parentElement=document;
        var result = parentElement.querySelectorAll(selector);
        if (result.length===1) {
            result = result[0];
        }
        result.queryString = selector;
        return result;
    };

    query.clearAllEvents = function (type) {
        var type = type || defaultSuffix;
        var ele;
        if (type===allSuffix) {
            for (var i in bindedElements) {
                ele = query(i);
                bindedElements[i].forEach(function(evtName) {
                    ele.off(evtName);
                });
            }
        }
        else {
            type = '.' + type;
            var len = type.length;
            for (var i in bindedElements) {
                ele = query(i);
                bindedElements[i].forEach(function(evtName) {
                    if (evtName.lastIndexOf(type)===evtName.length-len) {
                        ele.off(evtName);
                    }
                });
            }
        }
    }

    return query;
});
