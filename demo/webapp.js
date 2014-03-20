/*
var self = this;
if (self.document) {
}
else {
}
*/
define('../plugins/dom.witheventmanage.js', function($) {
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
    return function(data) {
        $.clearEvents();
        var callback = function(evt) {
            alert(evt.target.tagName);
        };

        $('#cc').on('click', callback);
    };
});
