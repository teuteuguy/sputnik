import gql from 'graphql-tag';

export default gql`
    subscription AddedSolution {
        addedSolution {
            solutions {
                id
                thingId
                name
                solutionBlueprintId
                createdAt
                updatedAt
            }
        }
    }
`;
