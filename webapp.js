/*
var self = this;
if (self.document) {
}
else {
}
*/
define(function() {
    document.querySelector('#cc').onclick = function() {
        window.exec('custom', function(option) {
            console.log(option);
        });
    };
    return function(data) {
        document.querySelector('#x').innerHTML = JSON.stringify(data);
    };
});
