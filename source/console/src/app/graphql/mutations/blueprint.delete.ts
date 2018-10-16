import gql from 'graphql-tag';

export default gql`
    mutation DeleteBlueprint(
        $id: String!
    ) {
        deleteBlueprint(
            id: $id
        ) {
            id
            name
            type
            compatibility
            spec
            createdAt
            updatedAt
        }
    }
`;
