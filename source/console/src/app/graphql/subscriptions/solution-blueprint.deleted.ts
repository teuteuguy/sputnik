import gql from 'graphql-tag';

export default gql`
    subscription DeletedSolutionBlueprint {
        deletedSolutionBlueprint {
            id
            name
            description
            spec
            createdAt
            updatedAt
        }
    }
`;
