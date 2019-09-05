import React from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import User from "./User";
import CartStyles from "./styles/CartStyles";
import CartItem from "./CartItem";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";
import Supreme from "./styles/Supreme";
import formatMoney from "../lib/formatMoney";
import calcTotalPrice from "../lib/calcTotalPrice";

export const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

export const TOGGLE_CART_MUTATION = gql`
  mutation TOGGLE_CART_MUTATION {
    toggleCart @client
  }
`;

const Cart = () => {
  return (
    <User>
      {({ data: { me } }) => {
        if (!me) return null;
        const cart = me.cart || [];
        return (
          <Mutation mutation={TOGGLE_CART_MUTATION}>
            {toggleCart => {
              return (
                <Query query={LOCAL_STATE_QUERY}>
                  {({ data }) => {
                    return (
                      <CartStyles open={data.cartOpen}>
                        <header>
                          <CloseButton title="close" onClick={toggleCart}>
                            &times;
                          </CloseButton>
                          <Supreme>{me.name}'s Cart</Supreme>
                        </header>
                        <p>
                          You have {cart.length} Item
                          {cart.length === 1 ? "s" : ""} in your Cart
                        </p>
                        <ul>
                          {cart.map(cartItem => (
                            <CartItem cartItem={cartItem} />
                          ))}
                        </ul>
                        <footer>
                          <p>{formatMoney(calcTotalPrice(cart))}</p>
                          {cart.length && <SickButton>Checkout</SickButton>}
                        </footer>
                      </CartStyles>
                    );
                  }}
                </Query>
              );
            }}
          </Mutation>
        );
      }}
    </User>
  );
};

export default Cart;
