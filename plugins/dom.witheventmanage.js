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

    var proxySuffix = 'proxy'
        ,pageSuffix = 'page'
        ;
    
    var evtPtn = /([a-z]+)\.([a-z]+)/;
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
            var info = {};
            if (evtPtn.test(eventName)) {
                eventName = RegExp.$1;
                info.suffix = RegExp.$2;
            }
            else {
                if (isProxy) {
                    info.suffix = proxySuffix;
                }
                else {
                    info.suffix = pageSuffix;
                }
            }
            info.name = eventName;
            if (filter) info.filter = filter;
            callback.info = info;
            this.addEventListener(eventName, callback, false);

            if (!this.callbacks || !(this.callbacks instanceof Array)) {
                this.callbacks = [];
            }
            this.callbacks.push(callback);

            var finished = false;
            var iEventName = eventName + '.' + callback.info.suffix;
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

            if (len===2) {
                if (typeof arguments[1]==='function') {
                    this.removeEventListener(eventName, arguments[1], false);
                    return this;
                }
                else {
                    filter = arguments[1];
                }
            }

            if (this.callbacks && this.callbacks instanceof Array && this.callbacks.length) {
                var suffix, mj=[];
                if (evtPtn.test(eventName)) {
                    eventName = RegExp.$1;
                    suffix = RegExp.$2;
                }
                var tmpCallback;
                for (var i=0,l=this.callbacks.length; i<l; i++) {
                    tmpCallback = this.callbacks[i];
                    if (tmpCallback.info.name===eventName && (!suffix || tmpCallback.info.suffix===suffix) && (!filter || tmpCallback.info.filter===filter)) {
                        this.off(eventName, tmpCallback);
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

    // 事件垃圾回收
    // 当某个dom被删除后，如果已经绑定了事件，则导致内存泄漏，需要手动清除
    query.gcEvents = function() {
    };
    // 清除所有事件
    query.clearAllEvents = function() {
        bindedElements.forEach(function(binded) {
            binded.events.forEach(function(eventName) {
                binded.node.off(eventName);
            });
        });
    };

    // 清除指定类型的事件
    query.clearEvents = function(type) {
        var type = type || [pageSuffix, proxySuffix];
        if (!(type instanceof Array)) {
            type = [type];
        }
        type.forEach(function(iType) {
            iType = '.' + iType;
            var len = iType.length;
            bindedElements.forEach(function(binded) {
                binded.events.forEach(function(eventName) {
                    if (eventName.lastIndexOf(iType)===eventName.length-len) {
                        binded.node.off(eventName);
                    }
                });
            });
        });
    };

    return query;
});
