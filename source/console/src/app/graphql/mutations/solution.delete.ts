import gql from 'graphql-tag';

export default gql`
    mutation UpdateSolution($id: String!) {
        updateSolution(id: $id) {
            id
            thingId
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
