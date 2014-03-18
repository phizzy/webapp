(function($) {
    // setTimeout & setInterval
    var dOut = window.setTimeout,
        dInterval = window.setInterval;
    window.setTimeout =  function(callback, time) {
        callback = window.lock(callback);
        return dOut(function() {
            if (!window.lockey.is(callback)) return;
            callback && callback();
        }, time);
    };
    window.setInterval =  function(callback, time) {
        callback = window.lock(callback);
        return dInterval(function() {
            if (!window.lockey.is(callback)) return;
            callback && callback();
        }, time);
    };
    // 执行webworker
    var workers = {};
    var ascId = 0;
    var exec = function(depend) {
        var tmp, len=0;
        for (var i in workers) {
            tmp = workers[i];
            len++
            if (!window.lockey.is(tmp)) {
                tmp.terminate();
                delete workers[i];
                len--
            }
        }
        if (len>=2) {
            return setTimeout(function() {
                exec(depend);
            }, 100);
        }
        var myUC, myWC;
        var myFC = window.lock(function() {
            if (!myUC || !myWC) return;
            myUC(myWC());
        });
        require(depend, function(dependOBJ) {
            if (typeof dependOBJ==='function') {
                myUC = dependOBJ;
            }
            else {
                throw new Error ('window.exec执行的require，函数返回值必须是function类型');
            }
            myFC();
        });
        var url = window.getURL(depend, 'webworker'),
            worker = new Worker(url);
        worker.id = isNaN(++ascId) ? 0 : ascId;
        workers[worker.id] = worker;
        worker.lockey = window.lockey.get();
        worker.onmessage = window.lock(function(oEvt) {
            myWC = function() {
                return oEvt.data;
            };
            myFC();
            delete workers[worker.id];
            worker.terminate();
        });
        worker.postMessage(depend);
    };
    $.exec = exec;
})(window);
