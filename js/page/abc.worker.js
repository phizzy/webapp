onmessage = function(oEvt) {
    var data = oEvt.data;
    // data.job
    // data.options
    if (data.job!=='abc') return;
    console.log('webworker处理结束，将数据返回');
    postMessage({
        data: {a:'asdf'}
    });
};
