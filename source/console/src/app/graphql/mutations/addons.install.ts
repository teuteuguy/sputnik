import gql from 'graphql-tag';

export default gql`
    mutation InstallAddon($key: String!) {
        installAddon(key: $key)
    }
`;
