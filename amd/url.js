(function(_) {
    var action = document.querySelector('meta[name=phizzy-url-action]')
        ,suffix = document.querySelector('meta[name=phizzy-url-suffix]')
        ,jsRoot = document.querySelector('meta[name=phizzy-url-rootjs]')
        ;

    action = action ? new RegExp(action.content) : '';
    suffix = suffix ? suffix.content : '';
    jsRoot = jsRoot ? (jsRoot.content.lastIndexOf('/')!==jsRoot.content.length-1 ? jsRoot.content+'/' : jsRoot.content) : '';

    var tmpSuffix = {
        webworker: 'worker'
    };
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
        var myI = name.lastIndexOf('.js');
        if (myI!==-1 && myI===name.length-3) {
            name = name.substring(0, name.length-3);
        }
        var myAction = name;
        if (action && action.test(name)) {
            myAction = RegExp._1;
        }
        var url = jsRoot + myAction + ((suffix && suffix[protocol]) ? '.'+suffix[protocol] : '') + '.js';
        url = url.replace(/(?:[a-z0-9_]+\/\.\.\/)|(?:\.\/)/, '');
        return url;
    };

    _.getURL = getURL;
})(window);
