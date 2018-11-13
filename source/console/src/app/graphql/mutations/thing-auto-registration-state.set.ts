import gql from 'graphql-tag';

export default gql`
    mutation SetThingAutoRegistrationState($enabled: Boolean!) {
        setThingAutoRegistrationState(enabled: $enabled)
    }
`;
