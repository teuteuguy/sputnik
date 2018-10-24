import gql from 'graphql-tag';

export default gql`
    query GetSolutionBlueprintStats {
        getSolutionBlueprintStats {
            total
        }
    }
`;
