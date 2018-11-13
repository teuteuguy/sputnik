import gql from 'graphql-tag';

export default gql`
    mutation AddDevice(
        $thingName: String!
        $spec: AWSJSON
        $generateCert: Boolean!
        $deviceTypeId: String!
        $deviceBlueprintId: String!
    ) {
        addDevice(
            thingName: $thingName
            spec: $spec
            generateCert: $generateCert
            deviceTypeId: $deviceTypeId
            deviceBlueprintId: $deviceBlueprintId
        ) {
            thingId
            thingName
            thingArn
            name
            deviceTypeId
            deviceBlueprintId
            greengrassGroupId
            spec
            lastDeploymentId
            createdAt
            updatedAt
        }
    }
`;
