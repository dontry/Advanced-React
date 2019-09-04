import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import { Mutation } from "react-apollo";
import { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION } from "./Cart";
import User from "./User";
import Signout from "./Signout";

const Nav = () => (
  <User>
    {({ data }) => {
      const me = data ? data.me : null;
      return (
        <NavStyles>
          <Link href="/items">
            <a>Items</a>
          </Link>
          {me ? (
            <>
              <Link href="/sell">
                <a>Sell</a>
              </Link>
              <Link href="/orders">
                <a>Orders</a>
              </Link>
              <Link href="/me">
                <a>Account</a>
              </Link>
              {me.permissions.includes("ADMIN") && (
                <Link href="/permission">Permissions</Link>
              )}
              <Mutation
                mutation={TOGGLE_CART_MUTATION}
                refetchQueries={{ query: LOCAL_STATE_QUERY }}>
                {toggleCart => (
                  <button
                    onClick={() => {
                      console.log("toggleCart");
                      toggleCart();
                    }}>
                    My Cart{" "}
                  </button>
                )}
              </Mutation>
              <Signout />
            </>
          ) : (
            <Link href="/signup">
              <a>Sign In</a>
            </Link>
          )}
        </NavStyles>
      );
    }}
  </User>
);

export default Nav;
