import gql from 'graphql-tag';

export default gql`
    subscription DeletedDevice {
        deletedDevice {
            thingId
            thingName
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
