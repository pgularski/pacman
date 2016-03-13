var random = random || {};


random.choice = function (array) {
    return array[Math.floor(Math.random() * array.length)];
}
