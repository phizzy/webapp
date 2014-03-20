define('../../plugins/dom.js', function($) {
    $('body').appendChild($('<header>Header</header><div id="main"></div><footer>Footer</footer>'));

    var container = $('#main');
    container.empty = function() {
        this.innerHTML = '';
        return this;
    };
    return container;
});
