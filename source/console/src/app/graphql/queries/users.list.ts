import gql from 'graphql-tag';

export default gql`
    query ListUsers($limit: Int, $nextToken: String) {
        listUsers(limit: $limit, nextToken: $nextToken) {
            users {
            }
            nextToken
        }
    }
`;
