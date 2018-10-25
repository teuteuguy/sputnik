import gql from 'graphql-tag';

export default gql`
    subscription UpdatedSolutionBlueprint {
        updatedSolutionBlueprint {
            id
            name
            description
            spec
            createdAt
            updatedAt
        }
    }
`;
