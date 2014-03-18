/*
var self = this;
if (self.document) {
}
else {
}
*/
define(function() {
    return function(data) {
        document.querySelector('body').innerHTML = JSON.stringify(data);
    };
});
