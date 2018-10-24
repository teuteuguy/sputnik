import gql from 'graphql-tag';

export default gql`
    mutation AddSolutionBlueprint($name: String!, $description: String, $thingIds: [String]!, $solutionBlueprintBlueprintId: String!) {
        addSolutionBlueprint(
            name: $name
            description: $description
            thingIds: $thingIds
            solutionBlueprintBlueprintId: $solutionBlueprintBlueprintId
        ) {
            id
            name
            description
            thingIds
            solutionBlueprintBlueprintId
            createdAt
            updatedAt
        }
    }
`;
