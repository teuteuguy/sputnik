import gql from 'graphql-tag';

export default gql`
    mutation AddDevice($thingName: String!) {
        addDevice(thingName: $thingName) {
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
