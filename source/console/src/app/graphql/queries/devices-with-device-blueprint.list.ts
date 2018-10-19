import gql from 'graphql-tag';

export default gql`
    query ListDevicesWithBlueprint($limit: Int, $nextToken: String) {
        listDevicesWithBlueprint(limit: $limit, nextToken: $nextToken) {
            devices {
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
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
