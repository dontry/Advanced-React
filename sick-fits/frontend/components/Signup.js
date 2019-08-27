import React, {Component} from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`;

class Signup extends Component {
  state = {
    name: "",
    email: "",
    password: ""
  };

  updateState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e, signup) => {
    e.preventDefault();
    await signup();
    this.setState({
      name: "",
      email: "",
      password: ""
    });
  };

  render() {
    return (
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
        {(signup, { error, loading }) => (
          <Form method="post" onSubmit={e => this.handleSubmit(e, signup)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Up for An Account</h2>
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  placeholder="email"
                  name="email"
                  value={this.state.email}
                  onChange={this.updateState}
                />
              </label>
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  placeholder="name"
                  name="name"
                  value={this.state.name}
                  onChange={this.updateState}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  placeholder="password"
                  name="password"
                  value={this.state.password}
                  onChange={this.updateState}
                />
              </label>
              <button type="submit">Sign UP</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Signup;
