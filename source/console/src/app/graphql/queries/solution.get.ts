import gql from 'graphql-tag';

export default gql`
    query GetSolution($id: String!) {
        getSolution(id: $id) {
            id
            name
            description
            thingIds
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
