import gql from 'graphql-tag';

export default gql`
    query GetSolutionStats {
        getSolutionStats {
            total
        }
    }
`;
