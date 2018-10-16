import gql from 'graphql-tag';

export default gql`
    query GetBlueprints($limit: Int, $nextToken: String) {
        getBlueprints(limit: $limit, nextToken: $nextToken) {
            blueprints {
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
