import gql from 'graphql-tag';

export default gql`
    mutation AddDevice($thingName: String!, $isGreengrass: Boolean!) {
        addDevice(thingName: $thingName, isGreengrass: $isGreengrass) {
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
