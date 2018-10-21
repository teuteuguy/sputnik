import gql from 'graphql-tag';

export default gql`
    subscription DeletedSolution {
        deletedSolution {
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
