import gql from 'graphql-tag';

export default gql`
    query ListDevices($limit: Int, $nextToken: String) {
        listDevices(limit: $limit, nextToken: $nextToken) {
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
                }
                lastDeploymentId
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
