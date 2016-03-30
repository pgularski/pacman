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


itertools.cycle = function(array) {
    var index = 0;
    return {
        next: function(){
            if (index === array.length) {
                index = 0;
            }
            return array[index++]
        }
    }
}
