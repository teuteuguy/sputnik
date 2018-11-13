import gql from 'graphql-tag';

export default gql`
    mutation UpdateSolution($id: String!, $name: String!, $description: String, $deviceIds: [String]!) {
        updateSolution(id: $id, name: $name, description: $description, deviceIds: $deviceIds) {
            id
            name
            description
            deviceIds
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
