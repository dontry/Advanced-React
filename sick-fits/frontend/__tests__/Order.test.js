import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import Order, { SINGLE_ORDER_QUERY } from "../components/Order";
import { fakeOrder } from "../lib/testUtils";

const mocks = [
  {
    request: { query: SINGLE_ORDER_QUERY, variables: { id: "ord123" } },
    result: { data: { order: fakeOrder() } }
  }
];

describe("<Order />", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks} appTypename={false}>
        <Order id="ord123" />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    console.log(wrapper.debug());

    const order = wrapper.find('div[data-test="order"]');
    expect(order.text()).toContain("ord123");
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
