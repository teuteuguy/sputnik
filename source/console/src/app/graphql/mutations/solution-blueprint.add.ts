import gql from 'graphql-tag';

export default gql`
    mutation AddSolutionBlueprint($name: String!, $description: String, $prefix: String!, $spec: AWSJSON!) {
        addSolutionBlueprint(
            name: $name
            description: $description
            prefix: $prefix
            spec: $spec
        ) {
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
