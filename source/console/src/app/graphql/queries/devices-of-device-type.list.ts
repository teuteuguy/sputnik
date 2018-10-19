import gql from 'graphql-tag';

export default gql`
    query ListDevicesOfDeviceType($limit: Int, $nextToken: String) {
        listDevicesOfDeviceType(limit: $limit, nextToken: $nextToken) {
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
