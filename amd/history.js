(function(_) {
    _.addEventListener('popstate', function(evt) {
        var state = evt.state || {};
        // 初始访问页面
        if (!state.pathInfo) {
            var pattern = /\/([a-z]+)/g
                ,isRouterableHash = /^\#\/[a-z\/]+/.test(window.location.hash)
                ,hash = isRouterableHash ? window.location.hash.substr(1) : window.location.pathname
                ,lastIndex = 0
                ,pathInfo  = []
                ,rs,tmp;

            while ((rs=pattern.exec(hash))!==null) {
                tmp = rs[1];
                pathInfo.push(tmp);
                lastIndex = pattern.lastIndex;
            }

            // 使用pathname作为router的条件，pathname==='/'
            if (lastIndex===0) {
                pathInfo.push('index');
            }

            state = {
                pathInfo: pathInfo.join('/')
                ,queryString: window.location.search
                ,hash: isRouterableHash ? '' : window.location.hash
            };
            window.history.replaceState(state, window.document.title, '/'+state.pathInfo+'/'+state.queryString+state.hash);
        }
        
        // 执行页面的渲染
        _.lockey.reset();
        // workerData：webworker通过异步的方式处理数据
        // requireData：通过异步的方式获取模板
        // 最后，将数据和模板填充到页面，完成页面渲染
        _.exec(state.pathInfo);
    });
})(window);
