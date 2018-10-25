import gql from 'graphql-tag';

export default gql`
    query GetSolutionBlueprint($id: String!) {
        getSolutionBlueprint(id: $id) {
            id
            name
            description
            prefix
            spec
            createdAt
            updatedAt
        }
    }
`;
