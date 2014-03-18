(function($) {
    $.lockey = {
        id: ''
        ,reset: function() {
            this.id = Math.random() + ':' + (new Date()).getTime();
        }
        ,get: function(reset) {
            if (reset || !this.id) this.reset();
            return this.id;
        }
        ,is: function(obj) {
            if (!obj.lockey) return false;
            if (obj.lockey!==this.id) return false;
            return true;
        }
        ,lock: function(callback, changeKey) {
            if (typeof callback !== 'function') return callback;
            if (callback.lockey) return callback;
            var that = $.lockey;
            var me = function() {
                if (me.lockey!==that.get()) return;
                return callback.apply(this, Array.prototype.slice.call(arguments));
            };
            me.lockey = that.get(!!changeKey)
            return me;
        }
    };
    $.lock = $.lockey.lock;
})(window);
