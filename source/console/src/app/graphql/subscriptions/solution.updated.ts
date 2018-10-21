import gql from 'graphql-tag';

export default gql`
    subscription UpdatedSolution {
        updatedSolution {
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
