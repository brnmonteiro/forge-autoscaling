Object.filter = function(obj, prefix) {
    var result = {},
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key) && key.toString().startsWith(prefix)) {
            result[key.slice(4, 100)] = obj[key];
        }
    }

    return result;
};
