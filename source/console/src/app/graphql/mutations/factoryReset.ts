import gql from 'graphql-tag';

export default gql`
    mutation FactoryReset(
        $cmd: String!
    ) {
        factoryReset(
            cmd: $cmd
        )
    }
`;
