import gql from 'graphql-tag';

export default gql`
    subscription AddedSolutionBlueprint {
        addedSolutionBlueprint {
            id
            thingIds
            name
            solutionBlueprintBlueprintId
            createdAt
            updatedAt
        }
    }
`;
