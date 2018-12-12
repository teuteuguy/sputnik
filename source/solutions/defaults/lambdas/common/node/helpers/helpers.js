module.exports = {
    topic: function(context) {
        if (
            context !== undefined &&
            context.clientContext !== undefined &&
            context.clientContext.Custom !== undefined &&
            context.clientContext.Custom.subject !== undefined
        ) {
            return context.clientContext.Custom.subject;
        } else {
            return false;
        }
    },
    reported: function(event) {
        if (
            event !== undefined &&
            event.state !== undefined &&
            event.state.reported !== undefined
        ) {
            return event.state.reported;
        } else {
            return false;
        }
    },
    getThingShadowAsync: function(client, params) {
        return new Promise(function(resolve, reject) {
            client.getThingShadow(params, function(err, data) {
                if(err) return reject(err);
                resolve(data);
            });
        });
    },
    updateThingShadowAsync: function(client, params) {
        return new Promise(function(resolve, reject) {
            client.updateThingShadow(params, function(err, data) {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }
};
