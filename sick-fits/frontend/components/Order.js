import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Head from "next/head";
import Error from "./ErrorMessage";
import OrderStyles from "./styles/OrderStyles";
import formatMoney from "../lib/formatMoney";
import { format } from "date-fns";

export const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY($id: ID! = "123") {
    order(id: $id) {
      id
      items {
        id
        title
        description
        image
        price
        quantity
      }
      user {
        id
      }
      total
      charge
      createdAt
    }
  }
`;

const Order = ({ id }) => {
  return (
    <Query query={SINGLE_ORDER_QUERY} variables={{ id }}>
      {({ data, loading, error }) => {
        if (error) return <Error error={error} />;
        if (loading) return <p>Loading...</p>;
        const order = data.order;
        return (
          <OrderStyles data-test="order">
            <Head>
              <title>Sick Fits - Order {order.id}</title>
            </Head>
            <p>
              <span>Order ID:</span>
              <span>{id}</span>
            </p>
            <p>
              <span>Charge:</span>
              <span>{order.charge}</span>
            </p>
            <p>
              <span>Date:</span>
              <span>{format(order.createdAt, "MMMM d, YYYY h:mm a")}</span>
            </p>
            <p>
              <span>Order Total:</span>
              <span>{formatMoney(order.total)}</span>
            </p>
            <div className="items">
              {order.items.map(item => (
                <div className="order-item" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div className="item-details">
                    <h2>{item.title}</h2>
                    <p>Qty: {item.quantity}</p>
                    <p>Each: {formatMoney(item.price)}</p>
                    <p>SubTotal: {formatMoney(item.price * item.quantity)}</p>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </OrderStyles>
        );
      }}
    </Query>
  );
};

export default Order;
