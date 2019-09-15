const bcrypt = require("bcryptjs");
const { forwardTo } = require("prisma-binding");
const { checkPermission } = require("../utils");
const Query = {
  dogs(parent, args, ctx, info) {
    return global.dogs;
  },
  // async items(parent, args, ctx, info) {
  //   return await ctx.db.query.items({ where: {} });
  // }
  //make use of the prisma built-in api
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
  },
  async users(parent, args, ctx, info) {
    // 1. check if user logged in
    if (!ctx.request.userId) {
      throw new Error("Please log in.");
    }
    // 2. check user permissions
    const hasPermission = checkPermission(ctx.request.user, [
      "ADMIN",
      "PERMISSION_UPDATE"
    ]);

    // 3. return users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    const { userId, user } = ctx.request;
    if (!userId) {
      throw new Error("you must be signed in!");
    }
    const order = await ctx.db.query.order(
      {
        where: {
          id: args.id
        }
      },
      info
    );

    // 3. Check if the user has permission to view the order
    const ownsOrder = order.user.id === userId;

    // 4. user permissions
    const hasPermission = checkPermission(user, ["ADMIN"]);
    if (!hasPermission || !ownsOrder) {
      throw new Error("You don't have permission to view the order");
    }

    return order;
  },
  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("you must be signed in!");
    }
    return ctx.db.query.orders(
      {
        where: {
          user: { id: userId }
        }
      },
      info
    );
  }
};

module.exports = Query;
