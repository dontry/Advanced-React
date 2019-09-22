import { mount } from "enzyme";
import wait from "waait";
import Signin from "../components/Signin";
import { CURRENT_USER_QUERY } from "../components/User";
import { fakeUser } from "../lib/testUtils";
import { MockedProvider } from "react-apollo/test-utils";

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } }
  }
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } }
  }
];

describe("<Signin />", () => {
  it("renders the sign in form to logged out users", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <Signin />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain("Sign In with your account");
    const SignIn = wrapper.find("Signin");
    expect(SignIn.exists()).toBe(true);
  });
});
