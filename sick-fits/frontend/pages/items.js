import React, { Component } from "react";
import { Query } from "react-apollo";
import styled from "styled-components";
import gql from "graphql-tag";
import Item from "../components/Item";

const FETCH_ALL_ITEMS = gql`
  query FETCH_ALL_ITEMS {
    items {
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
        <Query query={FETCH_ALL_ITEMS}>
          {({ data, loading, error }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: {error.message}</p>;

            return (
              <ItemsList>
                {data.items.map(item => (
                  <Item key={item.id} item={item} />
                ))}
              </ItemsList>
            );
          }}
        </Query>
      </Center>
    );
  }
}
