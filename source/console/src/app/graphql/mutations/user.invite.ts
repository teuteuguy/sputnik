import gql from 'graphql-tag';

export default gql`
    mutation InviteUser($name: String!, $email: String!, $groups: [String]!) {
        listUsers(name: $name, email: $email, groups: $groups)
    }
`;
