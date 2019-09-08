import React from "react";
import { Query, Mutation } from "react-apollo";
import { adopt } from "react-adopt";
import gql from "graphql-tag";
import User from "./User";
import CartStyles from "./styles/CartStyles";
import CartItem from "./CartItem";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";
import Supreme from "./styles/Supreme";
import formatMoney from "../lib/formatMoney";
import calcTotalPrice from "../lib/calcTotalPrice";
import Checkout from "./Checkout.js";

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

//https://github.com/pedronauck/react-adopt#leading-with-multiple-params
const Composed = adopt({
  user: <User />,
  mutation: ({ render }) => (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
      {(toggleCart, result) => render({ toggleCart, result })}
    </Mutation>
  ),
  localState: <Query query={LOCAL_STATE_QUERY} />
});

const Cart = () => {
  return (
    <Composed>
      {({ user, mutation, localState }) => {
        const me = user.data.me;
        if (!me) return null;
        const { toggleCart } = mutation;
        console.log("localState:", localState.data);
        return (
          <CartStyles open={localState.data.cartOpen}>
            <header>
              <CloseButton title="close" onClick={toggleCart}>
                &times;
              </CloseButton>
              <Supreme>{me.name}'s Cart</Supreme>
            </header>
            <p>
              You have {me.cart.length} Item
              {me.cart.length === 1 ? "s" : ""} in your Cart
            </p>
            <ul>
              {me.cart.map(cartItem => (
                <CartItem cartItem={cartItem} />
              ))}
            </ul>
            <footer>
              <p>{formatMoney(calcTotalPrice(me.cart))}</p>
              {me.cart.length && (
                <SickButton>
                  <Checkout>Checkout</Checkout>
                </SickButton>
              )}
            </footer>
          </CartStyles>
        );
      }}
    </Composed>
  );
};

export default Cart;
