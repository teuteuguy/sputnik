import gql from 'graphql-tag';

export default gql`
    mutation UpdateSolution($name: String!) {
        updateSolution(name: $name) {
            id
            thingId
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
