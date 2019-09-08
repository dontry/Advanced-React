import React, { Component } from "react";
import Downshift, { resetIdCounter } from "downshift";
import Router from "next/router";
import Link from "next/link";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import { debounce } from "lodash";
import { DropDown, DropDownItem, SearchStyles } from "./styles/DropDown";

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`;

class Search extends Component {
  state = {
    items: [],
    loading: false
  };
  onChange = debounce(async (e, client) => {
    // manually query apollo client
    this.setState({ loading: true });
    if (e.target.value === "") return;
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }
    });
    this.setState({
      items: res.data.items,
      loading: false
    });
  }, 300);

  redirectTo = item => {
    Router.push({ pathname: "/item", query: { id: item.id } });
  };

  render() {
    resetIdCounter();
    return (
      <SearchStyles>
        <Downshift
          itemToString={item => (item === null ? "" : item.title)}
          onChange={this.redirectTo}>
          {({
            getItemProps,
            getInputProps,
            isOpen,
            inputValue,
            highlightIndex
          }) => (
            <div>
              <ApolloConsumer>
                {client => (
                  <input
                    type="search"
                    {...getInputProps({
                      type: "search",
                      placeholder: "Search for an item",
                      id: "search",
                      className: this.state.loading ? "loading" : "",
                      onChange: e => {
                        e.persist();
                        this.onChange(e, client);
                      }
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      key={item.id}
                      {...getItemProps({ item })}
                      highlighted={index === highlightIndex}>
                      {/* <Link href={`/item?id=${item.id}`}> */}
                      {/* <a> */}
                      <img width="50" src={item.image} alt={item.title} />
                      {item.title}
                      {/* </a> */}
                      {/* </Link> */}
                    </DropDownItem>
                  ))}
                  {!this.state.items.length && !this.state.loading && (
                    <DropDownItem>No Item Found for The Keyword</DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default Search;
