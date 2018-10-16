import gql from 'graphql-tag';

export default gql`
    query GetStat($stat: String) {
        getStat(stat: $stat) {
            stat
            value
        }
    }
`;
