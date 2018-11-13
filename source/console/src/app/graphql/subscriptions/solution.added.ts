import gql from 'graphql-tag';

export default gql`
    subscription AddedSolution {
        addedSolution {
            id
            deviceIds
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
