import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import Pagination, { PAGINATION_QUERY } from "../components/Pagination";
import Router from "next/router";

Router.router = {
  push() {},
  prefetch() {}
};

const makeMocksWithLength = length => [
  {
    request: {
      query: PAGINATION_QUERY
    },
    result: {
      data: {
        itemsConnection: {
          __typename: "aggregate",
          aggregate: {
            count: length,
            __typename: "count"
          }
        }
      }
    }
  }
];

describe("<Pagination />", () => {
  it("renders with only 1 item", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksWithLength(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );

    expect(wrapper.text()).toContain("Loading...");
    await wait();
    wrapper.update();
    const pagination = wrapper.find('div[data-test="pagination"]');
    expect(pagination.text()).toContain("Page 1 of 1");
    expect(toJSON(pagination)).toMatchSnapshot();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toEqual(true);
    expect(wrapper.find("a.next").prop("aria-disabled")).toEqual(true);
  });

  it("renders with 5 pages with 18 items", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksWithLength(18)}>
        <Pagination page={1} perPage={4} />
      </MockedProvider>
    );

    expect(wrapper.text()).toContain("Loading...");
    await wait();
    wrapper.update();
    const pagination = wrapper.find('div[data-test="pagination"]');
    expect(pagination.text()).toContain("Page 1 of 5");
    expect(toJSON(pagination)).toMatchSnapshot();
  });

  it("disables prev button when rendering the first page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksWithLength(18)}>
        <Pagination page={1} perPage={4} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toEqual(true);
  });

  it("disables next button when rendering the first page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksWithLength(18)}>
        <Pagination page={5} perPage={4} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find("a.next").prop("aria-disabled")).toEqual(true);
  });

  it("enables next & prev button when in the middle of pages", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksWithLength(18)}>
        <Pagination page={2} perPage={4} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toEqual(false);
    expect(wrapper.find("a.next").prop("aria-disabled")).toEqual(false);
  });
});
