import gql from 'graphql-tag';

export default gql`
    mutation CreateCertificate($thingName: String!, $csr: String!, $attachToThing: Boolean!) {
        createCertificate(thingName: $thingName, csr: $csr, attachToThing: $attachToThing) {
            certificateArn
            certificateId
            certificatePem
        }
    }
`;
