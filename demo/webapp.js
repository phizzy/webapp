/*
var self = this;
if (self.document) {
}
else {
}
*/
define('../plugins/dom.js', function($) {
    return function(data) {
        var ele = document.createElement('p');
        ele.id = 'cc';
        ele.innerHTML = 'HTML';
        ele.className = 'adsf';
        $('body').appendChild(ele);
        var ele = document.createElement('p');
        ele.id = 'cd';
        ele.innerHTML = 'HTMLS';
        ele.className = 'adsf';
        $('body').appendChild(ele);

        var callback = function(evt) {
            alert(evt.target.tagName);
        };

        $('#cc').on('click', callback);
        setTimeout(function() {
            $('#cc').off('click', callback);
        }, 10000);
    };
});
