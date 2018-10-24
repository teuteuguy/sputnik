import gql from 'graphql-tag';

export default gql`
    query ListSolutionBlueprints($limit: Int, $nextToken: String) {
        listSolutionBlueprints(limit: $limit, nextToken: $nextToken) {
            solutionBlueprints {
                id
                name
                description
                spec
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
