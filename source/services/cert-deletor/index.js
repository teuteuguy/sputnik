const AWS = require('aws-sdk');
const s3 = new AWS.S3();

function handler(event, context, callback) {

    console.log('Event:', JSON.stringify(event, null, 2));

    if (event && event.hasOwnProperty('detail') && event.detail &&
        event.detail.hasOwnProperty('eventName') && event.detail.eventName === 'PutObject' &&
        event.detail.hasOwnProperty('requestParameters') && event.detail.requestParameters.hasOwnProperty('bucketName') && event.detail.requestParameters.bucketName === process.env.S3_CERT_BUCKET &&
        event.detail.requestParameters.hasOwnProperty('key')
        ) {

        let keyToDelete = event.detail.requestParameters.key;

        setTimeout(() => {

            s3.deleteObject({
                Bucket: process.env.S3_CERT_BUCKET,
                Key: keyToDelete
            }).promise().then((data) => {
                console.log('DeleteObject return:', data);
                callback(null, 'SUCCESS');
            }).catch((err) => {
                callback(err, null);
            });

        }, process.env.DELETE_TIMEOUT * 1000);

    } else {
        console.log('Not a PutObject API call');
        callback(null, 'SUCCESS');
    }
}

exports.handler = handler;
