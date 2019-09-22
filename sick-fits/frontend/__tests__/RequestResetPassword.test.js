import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import RequestReset, {
  REQUEST_RESET_MUTATION
} from "../components/RequestReset";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem, updateInput } from "../lib/testUtils";

describe("<RequestReset />", () => {
  it.skip("renders blank form", async () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("updates the form input", async () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    const input = updateInput(wrapper, "input", "email", "gg@gmail.com");

    await wait();
    wrapper.update();
    expect(input.props().value).toEqual("gg@gmail.com");
  });

  it("submits the form", async () => {
    const mocks = [
      {
        request: {
          query: REQUEST_RESET_MUTATION,
          variables: { email: "gg@gmail.com" }
        },
        result: {
          data: { requestReset: { message: "success" } }
        }
      }
    ];
    jest.spyOn(RequestReset.prototype, "saveToState");
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    updateInput(wrapper, "input", "email", "gg@gmail.com");
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();
    expect(RequestReset.prototype.saveToState.mock.calls.length).toBe(1);
    expect(wrapper.find("p").text()).toContain("Success! Check your email");
  });
});
