import gql from 'graphql-tag';

export default gql`
    mutation UpdateSolution($id: String!, $name: String!, $description: String, $thingIds: [String]!) {
        updateSolution(id: $id, name: $name, description: $description, thingIds: $thingIds) {
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
