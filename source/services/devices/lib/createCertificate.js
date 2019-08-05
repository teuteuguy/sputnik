const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const UsageMetrics = require('usage-metrics');

const lib = 'createCertificate';

// Following function creates a certificate for AWS IoT using the AWS CA.
// Function parameters:
// - .csr: CSR in pem format
// - .thingName: thingName
// - .attachToThing: boolean, attach new cert to the Thing

module.exports = function(event, context) {
    const usageMetrics = new UsageMetrics();
    const tag = `${lib}(${event.thingName}):`;

    console.log(tag, 'Start: Request cert creation from CSR:', event.csr);

    let _cert;

    return iot
        .createCertificateFromCsr({
            certificateSigningRequest: event.csr,
            setAsActive: true
        })
        .promise()
        .then(data => {
            _cert = data;
            console.log(tag, 'CertificateId', _cert.certificateId);

            if (event.attachToThing) {
                return iot
                    .attachThingPrincipal({
                        principal: _cert.certificateArn,
                        thingName: event.thingName
                    })
                    .promise()
                    .then(r => {
                        return iot
                            .attachPrincipalPolicy({
                                principal: _cert.certificateArn,
                                policyName: process.env.IOT_DEFAULT_CONNECT_POLICY
                            })
                            .promise();
                    });
            } else {
                return Promise.resolve(null);
            }
        })
        .then(result => {
            return _cert;
        })
        .catch(err => {
            console.error(err);
        });
};
