import Auth from "../components/Auth";
import OrderList from "../components/OrderList";

const OrderPage = props => (
  <div>
    <Auth>
      <OrderList />
    </Auth>
  </div>
);

export default OrderPage;
