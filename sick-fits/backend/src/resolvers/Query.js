const { forwardTo } = require("prisma-binding");
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
    } else {
      return ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
    }
  }
};

module.exports = Query;
