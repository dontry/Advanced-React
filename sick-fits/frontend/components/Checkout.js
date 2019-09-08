import React from "react";
import PropTypes from "prop-types";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import NProgress from "nprogress";
import gql from "graphql-tag";
import calcTotalPrice from "../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";

function totalItems(cart) {
  return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
}

const Checkout = ({ children }) => {
  function onToken() {
    console.log("on token");
  }
  return (
    <User>
      {({ data: { me } }) => (
        <StripeCheckout
          amount={calcTotalPrice(me.cart)}
          name="Sick Fits"
          description={`Order of ${totalItems(me.cart)} items!`}
          image={me.cart[0].item && me.cart[0].item.image}
          stripeKey="pk_test_cW4aJdaVlJXTjZU2jc7AC1Bc00QKk9eG7n"
          currency="USD"
          email={me.email}
          token={res => onToken(res)}>
          {children}
        </StripeCheckout>
      )}
    </User>
  );
};

export default Checkout;
