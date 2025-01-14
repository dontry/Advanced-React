import React, { Component } from "react";
import { Query } from "react-apollo";
import styled from "styled-components";
import gql from "graphql-tag";
import Item from "./Item";
import Pagination from "./Pagination";
import { perPage } from "../config";

export const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = 4) {
    items(skip: $skip, first: $first) {
      id
      title
      description
      price
      image
      largeImage
    }
  }
`;
const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

export default class Items extends Component {
  render() {
    return (
      <Center>
        <Pagination page={this.props.page} />
        <Query
          query={ALL_ITEMS_QUERY}
          // fetchPolicy="network-only"  no cache policy used
          variable={{ skip: (this.props.page - 1) * perPage }}>
          {({ data, loading, error }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: {error.message}</p>;

            return (
              <ItemsList data-test="item-list">
                {data.items.map(item => (
                  <Item key={item.id} item={item} />
                ))}
              </ItemsList>
            );
          }}
        </Query>
        <Pagination page={this.props.page} />
      </Center>
    );
  }
}
