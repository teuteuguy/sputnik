import gql from 'graphql-tag';

export default gql`
    subscription AddedDevice {
        addedDevice {
            thingId
            thingName
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
