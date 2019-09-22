import React from "react";
import { Mutation } from "react-apollo";
import styled from "styled-components";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

export const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

const RemoveFromCart = ({ id }) => {
  // This gets called as soon as we get a response back from the server after a mutation has been performed

  function update(cache, payload) {
    // 1. first read the cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    // 2. remove that item from the cart
    const cartItemId = payload.data.removeFromCart.id;
    data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);
    // 3. write it back to the cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  }
  return (
    <Mutation
      mutation={REMOVE_FROM_CART_MUTATION}
      variables={{ id }}
      update={update}
      // optimistic response; assume the response
      optimisticResponse={{
        __typename: "Mutation",
        removeFromCart: {
          __typename: "CartItem",
          id
        }
      }}>
      {(removeFromCart, { loading, error }) => (
        <BigButton
          title="Delete Item"
          disabled={loading}
          onClick={() => {
            removeFromCart().catch(err => alert(err.message));
          }}>
          &times;
        </BigButton>
      )}
    </Mutation>
  );
};

export default RemoveFromCart;
