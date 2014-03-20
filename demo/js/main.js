/*
var self = this;
if (self.document) {
}
else {
}
*/
define(['../../plugins/dom.js', '../js/template.js'], function($, container) {
    return function(data) {
        container.empty().appendChild($('<h2>Hello World</h2>'));
        $('h2', container).on('click', function() {
            console.log('h2: ', this.innerHTML);
        });
    };
});
