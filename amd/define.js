(function(_) {

    _.exports = _.exports || [];
    _.dependencies = _.dependencies || [];

    var define = function() {
        /**
         * The first argument, dependencies, is an array literal of the module ids that are dependencies required by the module that is being defined. The dependencies must be resolved prior to the execution of the module factory function, and the resolved values should be passed as arguments to the factory function with argument positions corresponding to indexes in the dependencies array.
         * The second argument, factory, is a function that should be executed to instantiate the module or an object. If the factory is a function it should only be executed once. If the factory argument is an object, that object should be assigned as the exported value of the module. If the factory function returns a value (an object, function, or any value that coerces to true), then that value should be assigned as the exported value for the module.
         */
        var args = Array.prototype.slice.call(arguments),
            len = args.length;
        if (len > 2) len = args.length = 2;

        var tmp;
        var factory = window.lock(args.pop()),
            dependencies = ((tmp=args.pop()) instanceof Array) ? tmp : (len===2 ? (tmp = [tmp]) : []);

        _.dependencies.push(dependencies);
        if (dependencies.length) {
            _.require(dependencies, function() {
                if (typeof factory==='function') {
                    _.exports.push(factory.apply(null, arguments));
                }
                else {
                    _.exports.push(factory);
                }
            });
        }
        else {
            if (typeof factory==='function') {
                _.exports.push(factory.apply(null));
            }
            else {
                _.exports.push(factory);
            }
        }
    };

    _.define = define;
})(window);

