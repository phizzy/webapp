/*
var self = this;
if (self.document) {
}
else {
}
*/
define('../components/dom.js', function($) {
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
            $.clearAllEvents();
        };
        var ccc = $('#cc');
        ccc.on('click', callback);
        $('#cd').on('click', function() {
            ccc.off('click');
            alert('her');
        });

        var nele = $('<h1>asdf</h1>');
        nele.on('click', function() {
            console.log('hhhhh');
        });
        $('body').appendChild(nele);
    };
});
