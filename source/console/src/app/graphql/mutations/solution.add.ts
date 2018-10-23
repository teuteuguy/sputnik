import gql from 'graphql-tag';

export default gql`
    mutation AddSolution($name: String!, $description: String, $thingIds: [String]!, $solutionBlueprintId: String!) {
        addSolution(
            name: $name
            description: $description
            thingIds: $thingIds
            solutionBlueprintId: $solutionBlueprintId
        ) {
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
