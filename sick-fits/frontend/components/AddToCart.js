import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

export const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`;

const AddToCart = ({ id }) => {
  return (
    <Mutation
      mutation={ADD_TO_CART_MUTATION}
      variables={{ id }}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
      {(addToCart, { loading }) => {
        return (
          <button disabled={loading} onClick={addToCart}>
            Add{loading && "ing"} To Cart 🛒
          </button>
        );
      }}
    </Mutation>
  );
};

export default AddToCart;
