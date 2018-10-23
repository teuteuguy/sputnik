import gql from 'graphql-tag';

export default gql`
    subscription UpdatedSolution {
        updatedSolution {
            id
            thingIds
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
