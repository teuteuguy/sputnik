import gql from 'graphql-tag';

export default gql`
    mutation AddBlueprint(
        $name: String!
        $type: String!
        $compatibility: [String]
        $deviceTypeMappings: AWSJSON
        $spec: AWSJSON
    ) {
        addBlueprint(
            name: $name
            type: $type
            compatibility: $compatibility
            deviceTypeMappings: $deviceTypeMappings
            spec: $spec
        ) {
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
