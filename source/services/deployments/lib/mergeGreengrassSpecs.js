
function extend(parent, child, parentkey, childkey) {
    let result = parent;
    console.log('extend:', parentkey, childkey);
    if (child.hasOwnProperty(parentkey) && child[parentkey].hasOwnProperty(childkey)) {
        console.log('extend: child has the keys');
        if (!result.hasOwnProperty(parentkey) || !result[parentkey].hasOwnProperty(childkey)) {
            console.log('extend: parent does not have the keys');
            result[parentkey] = {};
            result[parentkey][childkey] = [];
        }
        result[parentkey][childkey] = result[parentkey][childkey].concat(child[parentkey][childkey]);
        console.log('extend:', result[parentkey][childkey]);
    }
    return result;
}

module.exports = function (parent, child) {
    // "CoreDefinitionVersion": "Cores": [
    // "FunctionDefinitionVersion": "Functions": [
    // "LoggerDefinitionVersion": "Loggers": [
    // "SubscriptionDefinitionVersion": "Subscriptions": [
    // "ResourceDefinitionVersion": "Resources": [

    let result = parent;
    result = extend(result, child, 'CoreDefinitionVersion', 'Cores');
    result = extend(result, child, 'FunctionDefinitionVersion', 'Functions');
    result = extend(result, child, 'LoggerDefinitionVersion', 'Loggers');
    result = extend(result, child, 'SubscriptionDefinitionVersion', 'Subscriptions');
    result = extend(result, child, 'ResourceDefinitionVersion', 'Resources');
    return result;
};
