import React from "react";
import Auth from "../components/Auth";
import Order from "../components/Order";

const OrderPage = ({ query }) => {
  return (
    <Auth>
      <Order id={query.id} />
    </Auth>
  );
};

export default OrderPage;
