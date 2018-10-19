import gql from 'graphql-tag';

export default gql`
    query GetDevicesOfDeviceType($limit: Int, $nextToken: String) {
        getDevicesOfDeviceType(limit: $limit, nextToken: $nextToken) {
            devices {
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
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
