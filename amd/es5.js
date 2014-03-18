Array.prototype.forEach = Array.prototype.forEach || function(action, index) {
    for (var i=0,l=this.length; i<l; i++) {
        action(this[i], index);
    }
};
