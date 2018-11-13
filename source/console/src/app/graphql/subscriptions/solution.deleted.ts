import gql from 'graphql-tag';

export default gql`
    subscription DeletedSolution {
        deletedSolution {
            id
            deviceIds
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
