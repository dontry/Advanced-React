import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import SingleItem, { SINGLE_ITEM_QUERY } from "../components/SingleItem";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";

describe("<SingleItem />", () => {
  it("renders with proper data", async () => {
    const mocks = [
      {
        // when someone makes a request with this query and variable combo
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        // return this fake data (mocked data)
        result: {
          data: {
            item: fakeItem()
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );
    expect(wrapper.text()).toContain("Loading...");
    await wait();
    wrapper.update();
    expect(toJSON(wrapper.find("h2"))).toMatchSnapshot();
    expect(toJSON(wrapper.find("p"))).toMatchSnapshot();
    expect(toJSON(wrapper.find("img"))).toMatchSnapshot();
  });

  it("Errors with a not found item", async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: "123" } },
        result: {
          errors: [{ message: "Item Not Found" }]
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const error = wrapper.find('p[data-test="graphql-error"]');
    expect(error.text()).toContain("Item Not Found");
    expect(toJSON(error)).toMatchSnapshot();
  });
});
