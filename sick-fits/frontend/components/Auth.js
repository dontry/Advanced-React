import React from "react";
import { Query } from "react-apollo";
import Signin from "./Signin";
import { CURRENT_USER_QUERY } from "./User";

const Auth = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) return <h4>Loading...</h4>;
      if (!data.me) {
        return (
          <div>
            <h4>Please sign in before continuing</h4>
            <Signin />
          </div>
        );
      }

      return props.children;
    }}
  </Query>
);

export default Auth;
