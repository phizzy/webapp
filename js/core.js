/**
 * 
 * @author phizzy
 *
 * @date 2014-03-05 15:48
 * @description 解析URL，将请求分发
 *
 */

window.global = window.global || {};
window.lockey = {
    reset: function() {
        var tmp;
        while (true) {
            tmp = parseInt(99+Math.random(), 10) + '' + (new Date()).getTime();
            if (this.id !== tmp) {
                this.id = tmp;
                break;
            }
        }
    },
    get: function() {
        return this.id;
    }
};

(function(window) {
// 重写系统异步函数 && AJAX封装
    var dOut = setTimeout;
    window.setTimeout = function(callback, time) {
        callback.lockey = window.lockey.get();
        return dOut(function() {
            if (callback.lockey!==window.lockey.get()) {
                return;
            }
            callback && callback();
        }, time);
    };
    var dInterval = setInterval;
    window.setInterval = function(callback, time) {
        callback.lockey = window.lockey.get();
        var k = dInterval(function() {
            if (callback.lockey!==window.lockey.get()) {
                clearInterval(k);
                return;
            }
            callback && callback();
        }, time);
        return k;
    };
})(window);

(function(window) {
// 自定义事件
    var events = {},
        handlers = {};
    events = {
        create: function(name) {
            if (events[name]) {
                console.warn('存在重名的自定义event');
                return;
            }
            var evt = new Event(name);
            events[name] = evt;
            handlers[name] = [];
            window.addEventListener(name, function(evt) {
                var that = this;
                handlers[name].forEach(function(value) {
                    value && value.call(that, evt);
                });
            });
        }
        ,bind: function(name, handler) {
            events.create(name);
            handlers[name].push(handler);
        }
        ,remove: function(name) {
            if (events[name]) delete events[name];
            if (handlers[name]) delete handlers[name];
        }
        ,fire: function(name, obj) {
            if (!events[name]) return;
            events[name].name = name;
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    events[name][i] = obj[i];
                }
            }
            window.dispatchEvent(events[name]);
        }
    };
    window.bindEvent = events.bind;
    window.fireEvent = events.fire;
})(window);

(function(window) {
// require & define & render
    var map = window.fileMap || {};
    var getURL = function(name) {
        var url = map[name] || '/webapp/js/page/'+name+'.js';
        return url;
    };
    var required = {},
        requiring = {},
        requirerror = [];
    window.define = function() {
        var name, depends, handler;
        switch (parseInt(arguments.length, 10)) {
        case 3:
            name = arguments[0];
            depends = arguments[1];
            handler = arguments[2];
            break;
        case 2:
            name = arguments[0];
            handler = arguments[1];
            break;
        case 1:
            handler = arguments[0];
            break;
        case 0:
        default:
            return;
        }
        if (depends && depends.length) {
            require(depends, function() {
                required[name] = handler.apply(null, arguments) || {};
                requiring[name] = false;
            });
        }
        else {
            required[name] = handler.call(null) || {};
            requiring[name] = false;
        }
    };

    window.require = function(modules, callback) {
        if (!modules) return console.info('require参数错误');
        if (!(modules instanceof Array)) modules = [modules];
        if (typeof callback !== 'function') return console.info('require参数错误');
        callback.lockey = callback.lockey || window.lockey.get();
        var loadingDependent = false;
        modules.forEach(function(name, index, arr) {
            if (requirerror.indexOf(name)!==-1) return;
            if (required[name]) return;
            loadingDependent = true;
            if (!requiring[name]) {
                requiring[name] = true;
                // 默认静态文件路径
                // TODO 应该可以允许用户自定义的配置
                var url = getURL(name);
                var script = document.createElement('script');
                script.addEventListener('load', function() {
                    if (callback.lockey!==window.lockey.get()) return;
                    window.require(modules, callback);
                });
                script.addEventListener('error', function() {
                    requiring[name] = false;
                    requirerror.push(name);
                    throw new Error('模块'+name+'加载失败!');
                });
                script.src = url;
                var head = document.getElementsByTagName('head')[0];
                head.appendChild(script);
            }
        });
        if (!loadingDependent) {
            if (callback.lockey!==window.lockey.get()) return;
            var params = [];
            modules.forEach(function(name) {
                params.push(required[name]);
            });
            callback.apply(null, params);
        }
    };
    window.render = function(job, options, callback, keepLock) {
        if (typeof arguments[1] === 'function') {
            options = [];
            callback = arguments[1]
            keepLock = arguments[2] || false;
        }
        else {
            options = arguments[1] instanceof Array ? arguments[1] : [arguments[1]];
            callback = arguments[2];
            keepLock = arguments[3] || false;
        }
        var worker = new Worker(getURL.apply(null, [job+'.worker', options]));
        if (!keepLock) {
            window.lockey.reset();
        }
        worker.id = window.lockey.get();
        worker.addEventListener('message', function(oEvt) {
            if (worker.id===window.lockey.get()) {
                var tmp = oEvt.data instanceof Array ? oEvt.data : [oEvt.data];
                callback && callback.apply(worker, tmp);
            }
            worker.terminate();
        });
        worker.postMessage({
            job: job
            ,options: options
        });
    };
})(window);

(function(window) {
    var changeHandler = function(evt) {
        var hash = window.location.hash
            ,pattern = /\/([a-z]+)/g
            ,index = hash.indexOf('/')
            ,rs
            ,matches = []
            ,action
            ;

        // 是否将hash作为前端请求的router
        var isRouterableHash = /^\#\/[a-z\/]+/.test(hash);
        hash = isRouterableHash ? hash.substr(1) : window.location.pathname;

        var st = pattern.lastIndex,
            str = '';
        while ((rs=pattern.exec(hash))!==null) {
            str = rs[1];
            matches.push(str);
            st = pattern.lastIndex;
        }

        // 使用pathname作为router的条件，pathname==='/'
        if (st===0) {
            console.info('网站的根目录，默认使用action：index');
            matches.push('index');
        }

        var evtState = {
            params: matches
            ,fromType: evt.type
            ,hash: ''
        };

        if (!isRouterableHash) {
            evtState.hash = window.location.hash;
        }
        matches.push(window.location.search);
        window.fireEvent('render', evtState);
    };
    window.addEventListener('popstate', function(evt) {
        console.info('一起从这里开始');
        // popstate 每每都会触发，需要考虑它与DOMContentLoaded和hashchange的顺序和互斥
        var state = evt.state || {};
        if (!state.fromType) {
            console.info('页面第一次加载，或者进行了刷新操作，或者修改了hash');
            changeHandler(evt);
        }
        else {
            console.info('历史记录的前进或者后退操作');
            window.fireEvent('render', state);
        }
    });
    /*
     * 用poststate代替，时间的延迟仅有1ms，应该可以接受
    window.addEventListener('hashchange', changeHandler);
    document.addEventListener('DOMContentLoaded', changeHandler);
    */

    window.bindEvent('render', function(evt) {
        var action = evt.params[0];
        if (!action) return console.info('render事件需要传入合法的参数');
        var url = '/'+evt.params.join('/');
        console.info('美化地址栏地址');
        window.history.replaceState({params: evt.params, fromType: evt.fromType, hash: evt.hash}, window.document.title, url);
        //render(evt.params, evt.fromType);
        //@1:   通知系统，停止执行所有正在执行的render进程。
        //      通过上锁的方式实现
        //@2：  执行新的render进程
        //window.run(action, evt.params.slice(1));
        /*
        window.require('webapp', function($me) {
            $me();
        });
        */
        var params = evt.params;
        params.splice(0);

        var myData;
        var callback = function() {
            window.require(action, function(callback) {
                if (!myData) return console.info('依赖的webworker的执行结果尚未返回');
                console.info('执行action的回调函数，进行页面渲染');
                callback.apply(null, myData);
                if (evt.hash) {
                    window.fireEvent('hash', {'hash': evt.hash});
                }
            });
        };
        callback();
        console.info('通过webworker新开处理数据de线程');
        window.render(action, params, function() {
            myData = arguments;
            callback();
        });
    });

})(window);
