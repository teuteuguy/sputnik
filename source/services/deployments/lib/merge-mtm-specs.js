
// TODO: we probably need to check that the key alreay exists and then overwrite instead of concat !

function extend(parent, child, parentkey, childkey) {
    let result = parent;
    const tag = 'extend(' + parentkey + ', ' + childkey + '):';
    console.log(tag, 'start');
    if (child.hasOwnProperty(parentkey) && child[parentkey].hasOwnProperty(childkey)) {
        console.log(tag, 'child.' + parentkey, 'exists, AND child.' + parentkey + '.' + childkey + 'also exists. ie. child has the desired keys');
        if (!result.hasOwnProperty(parentkey) || !result[parentkey].hasOwnProperty(childkey)) {
            console.log(tag, 'parent.' + parentkey, 'doesnt exist OR parent.' + parentkey + '.' + childkey + 'doesnt exist. ie. parent does not have the desired keys.');
            result[parentkey] = {};
            result[parentkey][childkey] = [];
        }
        result[parentkey][childkey] = result[parentkey][childkey].concat(child[parentkey][childkey]);
        console.log(tag, result[parentkey][childkey]);
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
    result = extend(result, child, 'DeviceDefinitionVersion', 'Devices');
    return result;
};
