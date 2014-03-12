define('abc', function() {
    return function(data) {
        document.querySelector('#abc').innerHTML = 'abc.js';
        console.log('页面渲染完成');
    };
});
