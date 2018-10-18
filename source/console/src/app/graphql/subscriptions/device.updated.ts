import gql from 'graphql-tag';

export default gql`
    subscription UpdatedDevice {
        updatedDevice {
            thingId
            thingName
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
