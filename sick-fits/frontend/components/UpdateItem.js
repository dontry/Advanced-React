import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

export const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID) {
    item(where: { id: $id }) {
      title
      description
      price
      image
      largeImage
    }
  }
`;

export const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
    $image: String
    $largeImage: String
  ) {
    updateItem(
      data: {
        title: $title
        description: $description
        price: $price
        image: $image
        largeImage: $largeImage
      }
      where: { id: $id }
    ) {
      id
      title
    }
  }
`;

class UpdateItem extends Component {
  state = {};

  handleChange = e => {
    const { type, value, name } = e.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  handleSubmit = async (e, updateItemMutation) => {
    e.preventDefault();
    console.log("updating Item!!");

    const res = await updateItemMutation({
      variables: {
        ...this.state
      },
      where: { id: this.props.id }
    });
    console.log("Updated!");
  };

  render() {
    const { id } = this.props;
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id }}>
        {({ data, loading, error }) => {
          if (loading) return <p>Loading...</p>;
          if (!data.item) return <p>No Item Found for ID {id}</p>;
          console.log(data.item);
          const { item } = data;
          return (
            <Mutation
              mutation={UPDATE_ITEM_MUTATION}
              variables={{ id: this.props.id, ...this.state }}>
              {(updateItem, { loading, error }) => (
                <Form onSubmit={e => this.handleSubmit(e, updateItem)}>
                  <Error error={error} />
                  {/* use fieldset disabled attribute to stop user from editing when loading */}
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={item.title}
                        onChange={this.handleChange}
                      />
                    </label>
                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={item.price}
                        onChange={this.handleChange}
                      />
                    </label>
                    <label htmlFor="description">
                      Description
                      <textarea
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Description"
                        required
                        rows={10}
                        defaultValue={item.description}
                        onChange={this.handleChange}
                      />
                    </label>
                  </fieldset>
                  <button type="submit">Sav{loading ? "ing" : "e"}</button>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}
export default UpdateItem;
