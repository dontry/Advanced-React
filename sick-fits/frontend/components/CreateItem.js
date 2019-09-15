import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import { ALL_ITEMS_QUERY } from "./Items";
import Error from "./ErrorMessage";

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      data: {
        title: $title
        description: $description
        price: $price
        image: $image
        largeImage: $largeImage
      }
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: "",
    description: "",
    image: "",
    largeImage: "",
    price: 0
  };

  handleChange = e => {
    const { type, value, name } = e.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  handleSubmit = createItem => async e => {
    e.preventDefault();

    // call the mutation

    const res = await createItem();
    Router.push({ pathname: "/item", query: { id: res.data.createItem.id } });
  };

  uploadFile = async e => {
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "sick-fits");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/pag/image/upload/",
      {
        method: "POST",
        body: data
      }
    );

    const file = await res.json();
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    });
  };

  render() {
    const { title, description, price, image } = this.state;
    return (
      <Mutation
        refetchQueries={[{ query: ALL_ITEMS_QUERY }]}
        mutation={CREATE_ITEM_MUTATION}
        variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form onSubmit={this.handleSubmit(createItem)}>
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
                  value={title}
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
                  value={price}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="file">
                File
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  onChange={this.uploadFile}
                />
              </label>
              {image && <img width="200" src={image} alt={title} />}
              <label htmlFor="description">
                Description
                <textarea
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Description"
                  required
                  rows={10}
                  value={description}
                  onChange={this.handleChange}
                />
              </label>
            </fieldset>
            <button type="submit">Submit</button>
          </Form>
        )}
      </Mutation>
    );
  }
}
export default CreateItem;
