import gql from 'graphql-tag';

export default gql`
    mutation UpdateSolutionBlueprint($id: String!, $name: String!, $description: String, $thingIds: [String]!) {
        updateSolutionBlueprint(id: $id, name: $name, description: $description, thingIds: $thingIds) {
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
