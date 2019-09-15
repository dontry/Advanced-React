import React from "react";
import PropTypes from "prop-types";
import Router from "next/router";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import NProgress from "nprogress";
import gql from "graphql-tag";
import calcTotalPrice from "../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
    }
  }
`;

const Checkout = ({ children }) => {
  function onCheckout(res, createOrder) {
    NProgress.start();
    createOrder({ variables: { token: res.id } })
      .then(res => {
        console.log("order created:", res);
        Router.push({
          pathname: "/order",
          query: { id: res.data.createOrder.id }
        });
      })
      .catch(err => console.error(err));
  }
  return (
    <User>
      {({ data: { me } }) => (
        <Mutation
          mutation={CREATE_ORDER_MUTATION}
          refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
          {createOrder => (
            <StripeCheckout
              amount={calcTotalPrice(me.cart)}
              name="Sick Fits"
              description={`Order of ${totalItems(me.cart)} items!`}
              image={me.cart[0] && me.cart[0].item && me.cart[0].item.image}
              stripeKey="pk_test_cW4aJdaVlJXTjZU2jc7AC1Bc00QKk9eG7n"
              currency="USD"
              email={me.email}
              token={res => onCheckout(res, createOrder)}>
              {children}
            </StripeCheckout>
          )}
        </Mutation>
      )}
    </User>
  );
};

function totalItems(cart) {
  return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
}
export default Checkout;
