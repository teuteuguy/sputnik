import gql from 'graphql-tag';

export default gql`
    subscription UpdatedSolutionBlueprint {
        updatedSolutionBlueprint {
            id
            thingIds
            name
            solutionBlueprintBlueprintId
            createdAt
            updatedAt
        }
    }
`;
