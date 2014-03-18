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

    var bindedElements = [];

    var defaultSuffix = 'page'
        ,allSuffix = 'all';
    
    var evtPtn = /([a-z]+)\.([a-z]+)/;
    var chandler = {
        on: function(eventName, callback) {
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

            if (arguments.length==3) {
                if (!this.callbacks || !(this.callbacks instanceof Array)) {
                    this.callbacks = [];
                }
                this.callbacks.push(callback);

                var finished = false;
                var iEventName = eventName + '.' + callback.eventSuffix;
                var that = this;
                bindedElements.some(function(binded) {
                    if (binded.node.isSameNode(that)) {
                        if (binded.events.indexOf(iEventName)===-1) {
                            binded.events.push(iEventName);
                        }
                        finished = true;
                        return true;
                    }
                });
                if (!finished) {
                    bindedElements.push({
                        node: this
                        ,events: [iEventName]
                    });
                }
            }
            
            return this;
        }
        ,off: function(eventName, callback) {
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
                    var that = this;
                    bindedElements.some(function(binded, index) {
                        if (binded.node.isSameNode(that)) {
                            bindedElements.slice(index);
                            return true;
                        }
                    });
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

    query.clearProxyEvents = function(type) {
        var type = type || defaultSuffix;
        console.log(bindedElements);
        if (type===allSuffix) {
            bindedElements.forEach(function(binded) {
                binded.events.forEach(function(eventName) {
                    binded.node.off(eventName);
                });
            });
        }
        else {
            type = '.' + type;
            var len = type.length;
            bindedElements.forEach(function(binded) {
                binded.events.forEach(function(eventName) {
                    if (eventName.lastIndexOf(type)===eventName.length-len) {
                        binded.node.off(eventName);
                    }
                });
            });
        }
    };

    return query;
});
