import gql from 'graphql-tag';

export default gql`
    subscription DeletedSolutionBlueprint {
        deletedSolutionBlueprint {
            id
            thingIds
            name
            solutionBlueprintBlueprintId
            createdAt
            updatedAt
        }
    }
`;
