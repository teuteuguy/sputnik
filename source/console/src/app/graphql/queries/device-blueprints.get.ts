import gql from 'graphql-tag';

export default gql`
    query GetDeviceBlueprints($limit: Int, $nextToken: String) {
        getDeviceBlueprints(limit: $limit, nextToken: $nextToken) {
            deviceBlueprints {
                id
                name
                type
                compatibility
                deviceTypeMappings
                spec
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
