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
    return ctx.request.user;
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
  }
};

module.exports = Query;
