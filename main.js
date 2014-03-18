/*
var self = this;
if (self.document) {
}
else {
}
*/
define('animation/fadeIn', function() {
    return function(data) {
        document.querySelector('#x').innerHTML = JSON.stringify(data);
    };
});
