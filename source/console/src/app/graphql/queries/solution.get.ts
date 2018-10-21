import gql from 'graphql-tag';

export default gql`
    query ListSolutions($limit: Int, $nextToken: String) {
        listSolutions(limit: $limit, nextToken: $nextToken) {
            solutions {
                id
                thingId
                name
                solutionBlueprintId
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
