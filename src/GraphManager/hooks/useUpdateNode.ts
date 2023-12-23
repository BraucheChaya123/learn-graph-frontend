import { gql, useMutation } from "@apollo/client";
import { ApolloQueryResponse, CreateEntityResult, Text } from "./types";

const UPDATE_NODE = gql`
  mutation updateNode($description: Text!, $id: ID!) {
    updateNode(description: $description) {
      ID
    }
  }
`;

// UpdateNodeFn updates a new node with given description
export interface UpdateNodeFn {
  (argument: { id: string; description: Text }): Promise<UpdateNodeFnResponse>;
}

export interface UpdateNodeFnResponse {
  data?: { updateNode: { ID: string } };
}

export interface UpdateNodeResponse {
  data: CreateEntityResult;
  apollo: ApolloQueryResponse;
}

export function useUpdateNode(): {
  updateNode: UpdateNodeFn;
  response: UpdateNodeResponse;
} {
  const [updateNodeTMP, { data, loading, error }] = useMutation(UPDATE_NODE);
  const updateNode: UpdateNodeFn = ({ id, description }) =>
    updateNodeTMP({ variables: { id, description } });
  return { updateNode, response: { data, apollo: { loading, error } } };
}