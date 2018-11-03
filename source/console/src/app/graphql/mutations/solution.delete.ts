import gql from 'graphql-tag';

export default gql`
    mutation DeleteSolution($id: String!, $deleteResources: Boolean!) {
        deleteSolution(id: $id, deleteResources: $deleteResources) {
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
