import gql from 'graphql-tag';

export default gql`
    query GetDeployments($limit: Int, $nextToken: String) {
        getDeployments(limit: $limit, nextToken: $nextToken) {
            deployments {
                thingId
                deploymentId
                spec
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
