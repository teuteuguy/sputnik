import gql from 'graphql-tag';

export default gql`
    query GetDevice($thingId: String!) {
        getDevice(thingId: $thingId) {
            thingId
            thingName
            thingArn
            name
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
