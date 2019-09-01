import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";
import Title from "./styles/Title";
import ItemStyles from "./styles/ItemStyles";
import PriceTag from "./styles/PriceTag";
import formatMoney from "../lib/formatMoney";
import DeleteItem from "./DeleteItem";
import AddToCart from "./AddToCart";

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  };

  handleDelete = (e, deleteItem) => {
    if (window.confirm("Are you sure you want to delete")) {
      deleteItem().catch(e => window.alert(e.message));
    }
  };

  render() {
    const { item } = this.props;
    return (
      <Mutation mutation={DELETE_ITEM_MUTATION} variables={{ id: item.id }}>
        {(deleteItem, { loading, error }) => {
          return (
            <ItemStyles>
              <img src={item.image} alt={item.title} />
              <Title>
                <Link
                  href={{
                    pathname: "/item",
                    query: { id: item.id }
                  }}>
                  <a>{item.title}</a>
                </Link>
              </Title>
              <PriceTag>{formatMoney(item.price)}</PriceTag>
              <p>{item.description}</p>

              <div className="buttonList">
                <Link
                  href={{
                    pathname: "update",
                    query: { id: item.id }
                  }}>
                  <a>Edit ✏️</a>
                </Link>
                <AddToCart id={item.id} />
                <DeleteItem
                  onClick={e => this.handleDelete(e, deleteItem)}
                  id={item.id}>
                  Delete This Item
                </DeleteItem>
              </div>
            </ItemStyles>
          );
        }}
      </Mutation>
    );
  }
}
