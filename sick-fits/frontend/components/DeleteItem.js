import React from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import { ALL_ITEMS_QUERY } from "../components/Items";

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(where: { id: $id }) {
      id
      title
    }
  }
`;

const DeleteItem = ({ id, children }) => {
  const handleDelete = async (e, deleteItemMutation) => {
    if (window.confirm("Do you want to delete this item?")) {
      const res = await deleteItemMutation();
      console.log("Deleted!!");
    }
  };
  //Sometimes when you perform a mutation, your GraphQL server and your Apollo cache become out of sync. This happens when the update you're performing depends on data that is already in the cache
  const updateCache = (cache, payload) => {
    console.log("update cache");
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    // 2. Filter the deleted item out of the page
    data.items = data.items.filter(
      item => item.id !== payload.data.deleteItem.id
    );
    // 3. Put the items back!
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  };
  return (
    <Mutation
      mutation={DELETE_ITEM_MUTATION}
      variables={{ id }}
      update={updateCache}>
      {(deleteItem, { loading, error }) => {
        if (error) <ErrorMessage>{error.message}</ErrorMessage>;
        return (
          <button onClick={e => handleDelete(e, deleteItem)}>{children}</button>
        );
      }}
    </Mutation>
  );
};

export default DeleteItem;
