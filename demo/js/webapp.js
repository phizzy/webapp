/*
var self = this;
if (self.document) {
}
else {
}
*/
define(['../../plugins/dom.js', '../js/template.js'], function($, container) {
    return function(data) {
        container.empty().appendChild($('<h1>Hello World</h1>'));
        $('h1', container).on('click', function() {
            console.log('h1: ', this.innerHTML);
        });
    };
});
