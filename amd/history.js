(function(_) {

    var basePath = document.querySelector('meta[name=phizzy-history-base]');
    var mainPage = document.querySelector('meta[name=phizzy-history-main]');

    mainPage = mainPage ? mainPage.content : 'index';

    basePath = basePath ? (basePath.content.lastIndexOf('/')!==basePath.content.length-1 ? basePath.content+'/' : basePath.content) : '/';
    basePath = basePath.indexOf('/')===0 ? basePath : '/'+basePath;

    _.addEventListener('popstate', function(evt) {
        var state = evt.state || {};
        // 初始访问页面
        if (!state.pathInfo) {
            var pattern = /\/([a-z]+)/g
                ,hash = window.location.hash
                ,isRouterableHash = /^\#\/[a-z\/]+/.test(hash)
                ,lastIndex = 0
                ,pathInfo  = []
                ,rs,tmp;
            if (isRouterableHash) {
                hash = hash.substr(1);
            }
            else {
                tmp = window.location.pathname.indexOf(basePath);
                if (tmp===0) {
                    hash = window.location.pathname.replace(basePath, '');
                }
                else {
                    throw new Error('URL非法!');
                }
            }

            while ((rs=pattern.exec(hash))!==null) {
                tmp = rs[1];
                pathInfo.push(tmp);
                lastIndex = pattern.lastIndex;
            }

            // 使用pathname作为router的条件，pathname==='/'
            if (lastIndex===0) {
                pathInfo.push(mainPage);
            }

            state = {
                pathInfo: pathInfo.join('/')
                ,queryString: window.location.search
                ,hash: isRouterableHash ? '' : window.location.hash
            };

            window.history.replaceState(state, window.document.title, basePath+state.pathInfo+'/'+state.queryString+state.hash);
            
        }
        // 执行页面的渲染
        _.lockey.reset();
        // workerData：webworker通过异步的方式处理数据
        // requireData：通过异步的方式获取模板
        // 最后，将数据和模板填充到页面，完成页面渲染
        _.exec(state.pathInfo);
    });
})(window);
