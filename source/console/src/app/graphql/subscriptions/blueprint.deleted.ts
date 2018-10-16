import gql from 'graphql-tag';

export default gql`
    subscription DeletedBlueprint {
        deletedBlueprint {
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
