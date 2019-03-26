
class Helper {
    context(context) {
        return context && context.hasOwnProperty('clientContext') && context.clientContext.hasOwnProperty('Custom') && context.clientContext.Custom.hasOwnProperty('subject') && context.clientContext.Custom.subject;
    }
}

module.exports = Helper;

