/*
var self = this;
if (self.document) {
}
else {
}
*/
define('animation/fadeIn', function() {
    return function(data) {
        document.querySelector('body').innerHTML = JSON.stringify(data);
    };
});
