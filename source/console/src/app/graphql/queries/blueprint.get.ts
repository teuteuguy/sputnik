import gql from 'graphql-tag';

export default gql`
    query GetBlueprint($id: String!) {
        getBlueprint(id: $id) {
            id
            name
            type
            compatibility
            deviceTypeMappings
            spec
            createdAt
            updatedAt
        }
    }
`;
