import gql from 'graphql-tag';

export default gql`
    subscription AddedSolutionBlueprint {
        addedSolutionBlueprint {
            id
            name
            description
            spec
            createdAt
            updatedAt
        }
    }
`;
