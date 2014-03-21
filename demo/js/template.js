define('../../plugins/dom.js', function($) {
    var container = $('#main');
    container.empty = function() {
        this.innerHTML = '';
        return this;
    };
    return container;
});
