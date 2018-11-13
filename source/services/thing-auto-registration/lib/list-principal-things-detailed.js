const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('underscore');
const moment = require('moment');

const lib = 'listPrincipalThingsDetailed';

function _listPrincipalThings(certificateArn, nextToken) {
    return iot.listPrincipalThings({
        principal: certificateArn,
        maxResults: 75,
        nextToken: nextToken
    }).promise().then(data => {
        let _things = data.things;
        console.log('    _listPrincipalThings:', _things);
        if (data.nextToken) {
            return _listPrincipalThings(certificateArn, data.nextToken).then(things => {
                return _things.concat(things);
            })
        } else {
            // console.log('    _listPrincipalThings: return', data.things);
            return data.things;
        }
    });
}


module.exports = function (certificateArn) {

    return _listPrincipalThings(certificateArn).then(things => {
        console.log('listPrincipalThingsDetailed: things', things);
        return Promise.all(
            things.map(thing => {
                return iot.describeThing({
                    thingName: thing
                }).promise();
            })
        );
    }).then(things => {
        console.log(lib + ':', 'Found and Described: ' + things.length + ' things for the certificateArn: ' + certificateArn);
        things.forEach(t => {
            console.log(lib + ':', '    thingName: ' + t.thingName + ' (' + t.thingId + ')');
        });
        return things;
    });



    // iot.describeCertificate({
    //     certificateId: principal
    // }).promise().then(cert => {

    //     // Get the things attached to the cert
    //     return iot.listPrincipalThings({
    //         principal: cert.certificateDescription.certificateArn,
    //         maxResults: 10
    //     }).promise();

    // }).then(things => {
    //     things = things.things;

    //     return Promise.all(
    //         things.map(thing => {
    //             return iot.describeThing({
    //                 thingName: thing
    //             }).promise();
    //         })
    //     );

    // }).then(things => {
    //     console.log('describeThingsForPrincipal: Found and Described: ' + things.length + ' things for the principal: ' + principal);
    //     things.forEach(t => console.log('    - thingName: ' + t.thingName + ' (' + t.thingId + ')'));
    //     return things;
    // });
};
