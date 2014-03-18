(function($) {
    var action = document.querySelector('meta[name=phizzy-action]')
        ,suffix = document.querySelector('meta[name=phizzy-suffix]') // 'webworker:worker;page:'
        ,jsRoot = document.querySelector('meta[name=phizzy-root-js]')
        ;

    action = action ? new RegExp(action.content) : '';
    suffix = suffix ? suffix.content : '';
    jsRoot = jsRoot ? (jsRoot.content.lastIndexOf('/')!==jsRoot.content.length-1 ? jsRoot.content+'/' : jsRoot.content) : '';

    var tmpSuffix = {};
    if (suffix) {
        suffix = suffix.split(';');
        suffix.forEach(function(str) {
            if (!str) return;
            var kv = str.split(':');
            tmpSuffix[kv[0]] = kv[1];
        });
    }
    suffix = tmpSuffix;

    var getURL = function(name, protocol) {
        var myAction = name;
        if (action && action.test(name)) {
            myAction = RegExp.$1;
        }
        var url = jsRoot + myAction + (suffix[protocol] ? '.'+suffix[protocol] : '') + '.js';
        return url;
    };

    $.getURL = getURL;
})(window);
