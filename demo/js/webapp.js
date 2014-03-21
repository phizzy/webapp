/*
var self = this;
if (self.document) {
}
else {
}
*/
define(['../../plugins/dom.js', '../js/template.js'], function($, container) {
    return function(data) {
        container.empty().appendChild($('<div class="img-container"><span class="img"></span><span class="img"></span><span class="img"></span><span class="img"></span><span class="img"></span><span class="img"></span><span class="img"></span></div>'));
        return;
        var esX, csX;
        var eeX;
        var ts;
        $('.img-container', container).on('touchstart', function(evt) {
            csX = evt.changedTouches[0].clientX;
            esX = parseInt(this.style.marginLeft, 10) || 0;
            ts = ts || evt.timeStamp;
        });

        $('.img-container', container).on('touchmove', function(evt) {
            eeX = esX + evt.changedTouches[0].clientX - csX;
            this.style.marginLeft = eeX + 'px';
        });
        $('.img-container', container).on('touchend', function(evt) {
            var te = evt.timeStamp;
            var step = (eeX - esX) * (te - ts) / 1000;
            var i = 1;
            var that = this;
            var lvl = 100;
            step = step / lvl;
            var base = 10;
            var itv = setInterval(function() {
                that.style.marginLeft = eeX + step * i * base * (lvl-i) / lvl + 'px';
                i++;
                if (i>lvl) {
                    clearInterval(itv);
                    ts = 0;
                }
            }, 1);
        });

    };
});
