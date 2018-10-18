import gql from 'graphql-tag';

export default gql`
    query GetDevicesWithBlueprint($limit: Int, $nextToken: String) {
        getDevicesWithBlueprint(limit: $limit, nextToken: $nextToken) {
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
