import gql from 'graphql-tag';

export default gql`
    mutation UpdateDevice($thingId: String!, $name: String!, $deviceTypeId: String!, $deviceBlueprintId: String!) {
        updateDevice(
            thingId: $thingId
            name: $name
            deviceTypeId: $deviceTypeId
            deviceBlueprintId: $deviceBlueprintId
        ) {
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
            greengrassGroupId
            lastDeploymentId
            createdAt
            updatedAt
        }
    }
`;
