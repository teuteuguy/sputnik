import gql from 'graphql-tag';

export default gql`
    subscription AddedSolution {
        addedSolution {
            id
            thingIds
            name
            solutionBlueprintId
            createdAt
            updatedAt
        }
    }
`;
