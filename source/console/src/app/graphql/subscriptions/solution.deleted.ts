import gql from 'graphql-tag';

export default gql`
    subscription DeletedSolution {
        deletedSolution {
            id
            thingIds
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
