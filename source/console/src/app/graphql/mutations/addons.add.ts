import gql from 'graphql-tag';

export default gql`
    mutation AddAddon($addonId: String!, cfnUrl: String!) {
        addAddon(addonId: $addonId, cfnUrl: $cfnUrl)
    }
`;
