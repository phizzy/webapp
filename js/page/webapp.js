/*
var self = this;
if (self.document) {
}
else {
}
*/
define('webapp', function() {
    window.bindEvent('hash', function(evt) {
        document.querySelector(evt.hash).scrollIntoView();
    });
    return function(data) {
        document.querySelector('#abc').innerHTML = JSON.stringify(data);
        console.log('页面渲染完成');
    };
});

