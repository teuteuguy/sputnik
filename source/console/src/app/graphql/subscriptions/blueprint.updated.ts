import gql from 'graphql-tag';

export default gql`
    subscription UpdatedBlueprint {
        updatedBlueprint {
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
