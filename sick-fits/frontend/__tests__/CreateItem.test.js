import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import CreateItem, { CREATE_ITEM_MUTATION } from "../components/CreateItem";
import { fakeItem } from "../lib/testUtils";
import { ALL_ITEMS_QUERY } from "../components/Items";

Router.router = {
  push: jest.fn()
};

const imgUrl = "https://www.example.com/";

describe("<CreateItem />", () => {
  it("renders and match snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });
  it("uploads a file ", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    window.fetch = jest.fn().mockResolvedValue({
      json: () => ({
        secure_url: imgUrl,
        eager: [{ secure_url: imgUrl }]
      })
    });
    const createItemComponent = wrapper.find("CreateItem").instance();
    jest.spyOn(createItemComponent, "uploadFile");

    wrapper.find('input[name="file"]').simulate("change", {
      target: {
        files: ["ite.jpg"]
      }
    });

    await wait();
    wrapper.update();

    expect(window.fetch).toHaveBeenCalled();
    // expect(createItemComponent.uploadFile).toHaveBeenCalled();
    expect(createItemComponent.state.image).toBe(imgUrl);
    expect(createItemComponent.state.largeImage).toBe(imgUrl);

    jest.clearAllMocks();
  });

  it("handles state updating", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const instance = wrapper.find("CreateItem").instance();
    jest.spyOn(instance, "handleChange");
    wrapper.find("#title").simulate("change", {
      target: {
        name: "title",
        value: "title"
      }
    });
    wrapper.find("#price").simulate("change", {
      target: {
        name: "price",
        value: 53
      }
    });

    wrapper.find("#description").simulate("change", {
      target: {
        name: "description",
        value: "create a new item"
      }
    });

    expect(instance.state.title).toEqual("title");
    expect(instance.state.price).toEqual(53);
    expect(instance.state.description).toEqual("create a new item");
  });
  it.only("create an item when the form is submitted", async () => {
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: "",
            description: "",
            image: "",
            largeImage: "",
            price: 0
          }
        },
        result: {
          data: {
            createItem: {
              id: "abc123"
            }
          }
        }
      },
      {
        request: {
          query: ALL_ITEMS_QUERY,
          variables: {}
        },
        result: {
          data: {
            items: [fakeItem()]
          }
        }
      }
    ];
    window.fetch = jest.fn().mockResolvedValue({
      json: () => ({
        secure_url: imgUrl,
        eager: [{ secure_url: imgUrl }]
      })
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CreateItem />
      </MockedProvider>
    );

    const instance = wrapper.find("CreateItem").instance();
    jest.spyOn(instance, "handleSubmit");

    wrapper.find('form[data-test="form"]').simulate("submit");
    await wait(50);
    wrapper.update();
    expect(Router.router.push).toHaveBeenCalled();
    expect(instance.handleSubmit).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/item",
      query: { id: "abc123" }
    });
  });
});
