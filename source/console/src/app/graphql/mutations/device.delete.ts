import gql from 'graphql-tag';

export default gql`
    mutation DeleteDevice($thingId: String!) {
        deleteDevice(thingId: $thingId) {
            thingId
            thingName
            thingArn
            device
            deviceTypeId
            blueprintId
            connectionState {
                state
                at
                certificateId
                certificateArn
            }
            greengrassGroupId
            lastDeploymentId
            createdAt
            updatedAt
        }
    }
`;
