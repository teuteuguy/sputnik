import gql from 'graphql-tag';

export default gql`
    mutation AddSolution($name: String!, $solutionBlueprintId: String!) {
        addSolution(name: $name, solutionBlueprintId: $solutionBlueprintId) {
            id
            thingId
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
