import gql from 'graphql-tag';

export default gql`
    mutation DeleteSolution($id: String!) {
        deleteSolution(id: $id) {
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
