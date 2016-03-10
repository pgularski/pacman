var itertools = itertools || {};


itertools.makeIterator = function(array){
    var nextIndex = 0;

    return {
        next: function(){
            return nextIndex < array.length ?
                {value: array[nextIndex++], done: false} :
                {done: true};
        }
    }
}

itertools.cycle = function (array) {
    var Cycle = function (array) {
        var self = this;
        self.index = 0;
        self.array = array;
    }

    Cycle.prototype.next = function () {
        var self = this;
        while (true) {
            if (self.index >= self.array.length) {
                self.index = 0;
            }
            return self.array[self.index++];
        }
    }
    return new Cycle(array);
}
