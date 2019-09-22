import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";
import Items, { ALL_ITEMS_QUERY } from "../components/Items";

const mocks = [
  {
    request: {
      query: ALL_ITEMS_QUERY,
      variables: { skip: 0, first: 4 }
    },
    result: {
      data: {
        items: [fakeItem(), fakeItem(), fakeItem(), fakeItem()],
        __typename: "Item"
      }
    }
  }
];

describe("<Items />", () => {
  it("renders with first 4 items with default variables", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Items page={1} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const itemList = wrapper.find('div[data-test="item-list"]');
    expect(itemList.find("Item").length).toBe(4);
  });
});
