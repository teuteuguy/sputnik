import gql from 'graphql-tag';

export default gql`
    query GetDevices($limit: Int, $nextToken: String) {
        getDevices(limit: $limit, nextToken: $nextToken) {
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
                }
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
