const { forwardTo } = require("prisma-binding");
const Query = {
  dogs(parent, args, ctx, info) {
    return global.dogs;
  },
  // async items(parent, args, ctx, info) {
  //   return await ctx.db.query.items({ where: {} });
  // }
  items: forwardTo("db")
};

module.exports = Query;
