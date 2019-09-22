import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { ApolloConsumer } from "react-apollo";
import { MockedProvider } from "react-apollo/test-utils";
import RemoveFromCart, {
  REMOVE_FROM_CART_MUTATION
} from "../components/RemoveFromCart";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

const mocks = [
  {
    request: {
      query: REMOVE_FROM_CART_MUTATION,
      variables: {
        id: "omg123"
      }
    },
    result: {
      data: {
        removeFromCart: {
          id: "omg123",
          __typename: "CartItem"
        }
      }
    }
  },
  {
    request: {
      query: CURRENT_USER_QUERY
    },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem()]
        }
      }
    }
  },
  {
    request: {
      query: CURRENT_USER_QUERY
    },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: []
        }
      }
    }
  }
];

describe("<RemoveFromCart />", () => {
  it("renders and matches the snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RemoveFromCart id="omg123" />
      </MockedProvider>
    );
    expect(toJSON(wrapper.find("button"))).toMatchSnapshot();
  });

  it("removes item from cart", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <RemoveFromCart id="omg123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const {
      data: { me }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(me.cart.length).toBe(1);
    expect(me.cart[0].id).toBe("omg123");

    wrapper.find("button").simulate("click");
    expect(wrapper.find("button").prop("disabled")).toBe(true);

    await wait(300);
    const {
      data: { me: me2 }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(me2.cart.length).toBe(0);
  });
});
