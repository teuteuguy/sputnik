import gql from 'graphql-tag';

export default gql`
    subscription UpdatedSolution {
        updatedSolution {
            id
            deviceIds
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
