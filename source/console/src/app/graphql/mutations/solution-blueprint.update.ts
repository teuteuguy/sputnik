import gql from 'graphql-tag';

export default gql`
    mutation UpdateSolutionBlueprint($id: String!, $name: String!, $description: String, $prefix: String!, $spec: AWSJSON!) {
        updateSolutionBlueprint(id: $id, name: $name, description: $description, prefix: $prefix, spec: $spec) {
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
