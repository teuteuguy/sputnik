import gql from 'graphql-tag';

export default gql`
    mutation RefreshSolution($id: String!) {
        refreshSolution(id: $id)
    }
`;
