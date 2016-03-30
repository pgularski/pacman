(function() {
    var root = this;
    var itertools = {};

    // Export the itertools to Node.js, as in Underscore.js
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = itertools;
        }
        exports.itertools = itertools;
    } else {
        root.itertools = itertools;
    }

    // From MDN
    itertools.makeIterator = function(array) {
        var nextIndex = 0;

        return {
            next: function () {
                return nextIndex < array.length ?
                    {value: array[nextIndex++], done: false} :
                    {done: true};
            }
        }
    };

    itertools.cycle = function (array) {
        var index = 0;
        return {
            next: function () {
                if (index === array.length) {
                    index = 0;
                }
                return array[index++];
            }
        }
    };
}.call(this));
