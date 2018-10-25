import gql from 'graphql-tag';

export default gql`
    mutation DeleteSolutionBlueprint($id: String!) {
        deleteSolutionBlueprint(id: $id) {
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
