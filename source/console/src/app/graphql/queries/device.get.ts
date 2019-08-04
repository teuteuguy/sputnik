import gql from 'graphql-tag';

export default gql`
    query GetDevice($thingId: String!) {
        getDevice(thingId: $thingId) {
            thingId
            thingName
            thingArn
            name
            deviceTypeId
            deviceBlueprintId
            connectionState {
                state
                at
                certificateId
                certificateArn
            }
            cert {
                certificateId
                at
            }
            spec
            greengrassGroupId
            lastDeploymentId
            createdAt
            updatedAt
        }
    }
`;
