import gql from 'graphql-tag';

export default gql`
    mutation AddSolution($name: String!, $description: String, $deviceIds: [String]!, $solutionBlueprintId: String!) {
        addSolution(
            name: $name
            description: $description
            deviceIds: $deviceIds
            solutionBlueprintId: $solutionBlueprintId
        ) {
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
