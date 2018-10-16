import gql from 'graphql-tag';

export default gql`
    subscription AddedBlueprint {
        addedBlueprint {
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
