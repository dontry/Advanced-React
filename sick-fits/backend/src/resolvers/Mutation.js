const Mutations = {
  createDog(parent, args, ctx, info) {
    global.dogs = global.dogs || [];
    const newDog = { name: args.name };
    global.dogs.push(newDog);
    return newDog;
  },
  async createItem(parent, args, ctx, info) {
    const { title, description, price } = args.data;
    console.log(args);

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          title,
          description,
          price
        }
      },
      info
    ); // backend needs to access 'prisma query' info  for actual query
    return item;
  }
};

module.exports = Mutations;
