var arraytools = arraytools || {};


arraytools.inArray = function (array, object) {
    return array.indexOf(object) !== -1;
}


arraytools.isEqual = function (arrayA, arrayB) {
    if (!arrayA || !arrayB) {
        return false;
    }
    if (arrayA.length !== arrayB.length) {
        return false;
    }
    for (var i = 0; i < arrayA.length; i++) {
        if (arrayA[i] instanceof Array && arrayB[i] instanceof Array) {
            if (!arraytools.isEqual(arrayA[i], arrayB[i])) {
                return false;
            }
        }
        else if (arrayA[i] !== arrayB[i]) {
            return false;
        }
    }
    return true;
}

//console.log( arraytools.isEqual([1], [1]) );
//console.log( arraytools.isEqual([1, [1, 2]], [1, [1, 2]]) );
//console.log('===');
//console.log( arraytools.isEqual(null, [1]) );
//console.log( arraytools.isEqual([], [1]) );
//console.log( arraytools.isEqual(1, [1]) );
//console.log( arraytools.isEqual([1], [2]) );
//console.log( arraytools.isEqual([1, [1, 2]], [1, [1, 1]]) );
