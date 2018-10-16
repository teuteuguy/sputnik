import gql from 'graphql-tag';

export default gql`
    query GetDeviceTypes($limit: Int, $nextToken: String) {
        getDeviceTypes(limit: $limit, nextToken: $nextToken) {
            deviceTypes {
                id
                name
                type
                spec
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
