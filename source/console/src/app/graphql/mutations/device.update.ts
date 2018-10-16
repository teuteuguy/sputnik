import gql from 'graphql-tag';

export default gql`
    mutation UpdateDevice($thingId: String!, $name: String!, $deviceTypeId: String!, $blueprintId: String!) {
        updateDevice(thingId: $thingId, name: $name, deviceTypeId: $deviceTypeId, blueprintId: $blueprintId) {
            thingId
            thingName
            thingArn
            name
            deviceTypeId
            blueprintId
            connectionState {
                state
                at
            }
            createdAt
            updatedAt
        }
    }
`;
