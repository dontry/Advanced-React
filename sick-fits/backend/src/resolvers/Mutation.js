const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transporter, resetPasswordTemplate } = require("../mailer");
const { checkPermission } = require("../utils");

const Mutations = {
  createDog(parent, args, ctx, info) {
    global.dogs = global.dogs || [];
    const newDog = { name: args.name };
    global.dogs.push(newDog);
    return newDog;
  },
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // This is how to create a relationship between the Item and the User
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args.data
        }
      },
      info
    );
    return item;
  },

  async updateItem(parent, args, ctx, info) {
    const update = { ...args.data };
    const id = args.where.id;
    const item = await ctx.db.mutation.updateItem(
      {
        data: update,
        where: { id }
      },
      info
    );
    console.log(`updated item: ${JSON.stringify(item, null, 2)}`);
    return item;
  },

  async deleteItem(parent, args, ctx, info) {
    // 1. check if user logged in
    if (!ctx.request.user) {
      throw new Error("Please log in.");
    }
    const hasPermission = checkPermission(ctx.request.user, [
      "ADMIN",
      "ITEM_DELETE"
    ]);
    // 1. Find the item
    const { where } = args;
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`);

    // // 2. Check if they own that item, or have the permissions
    const hasOwnership = item.user && item.user.id === ctx.request.userId;
    if (!hasOwnership || !hasPermission) {
      throw new Error("Sorry, you are not authorized to delete the item.");
    }

    // 3. Delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.name = args.name.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: { ...args, password, permissions: { set: ["USER"] } }
      },
      info
    );
    //create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  async signin(parent, args, ctx, info) {
    const { email, password } = args;
    // check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      return new Error(`User not found with email: ${email}`);
    }

    // 2. Check if their password is correct
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Error(`Invalid password`);
    }

    //create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });

    // 5. Return the user
    return user;
  },
  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Sign out!" };
  },
  async requestReset(parent, args, ctx, info) {
    // 1. Check if it is a valid user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      return new Error(`User not found with email: ${email}`);
    }

    // 2. Set a reset token and an expiry date
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = await randomBytes(10).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // valid within 1 hour

    await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    let feedback = await transporter.sendMail({
      from: "Sick-fits@gmail.com", // sender address
      to: user.email,
      subject: "Reset Password",
      html: resetPasswordTemplate(`Your Password Reset Token is Here!
      \n\n
        <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click Here to Reset</a>
        `)
    });

    console.log("Message sent: %s", feedback.messageId);

    return { message: "Reset password request sent." };
  },
  async resetPassword(parent, args, ctx, info) {
    const { password, confirmPassword, resetToken } = args;
    // 1. validate passwords
    if (password !== confirmPassword) {
      return new Error("Passwords do not match.");
    }
    // 2.  search user with the token & check expiry
    const [user] = await ctx.db.query.users({
      where: { resetToken, resetTokenExpiry_gte: Date.now() }
    });
    if (!user) {
      return new Error("No matched user found.");
    }
    // 3. hash the new password
    const newPassword = await bcrypt.hash(password, 10);
    // 4. update passwords and clear resetToken & resetTokenExpiry field
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { id: user.id },
      data: { password: newPassword, resetToken: null, resetTokenExpiry: null }
    });
    // 5. create JWT tokens
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 6.  Set JWT token cookie
    ctx.response.cookie("token", token);
    // 7. return updated user
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    // 1. check if the user logged in
    if (!ctx.request.user) {
      throw new Error("Please log in.");
    }

    // 2. check user permissions
    const hasPermission = checkPermission(ctx.request.user, [
      "ADMIN",
      "PERMISSION_UPDATE"
    ]);

    // 3. update user permissions
    const updatedUser = await ctx.db.mutation.updateUser(
      {
        where: { id: args.userId },
        data: {
          permissions: { set: args.permissions }
        }
      },
      info
    );

    return updatedUser;
  },
  async addToCart(parent, args, ctx, info) {
    // 1. Check user logged in
    if (!ctx.request.userId) {
      throw new Error("Please log in.");
    }
    // 2. Get cart item from the user;
    const [existingCartItem] = await ctx.db.query.cartItems(
      {
        where: {
          item: { id: args.id },
          user: { id: ctx.request.userId }
        }
      },
      info
    );
    console.log(existingCartItem);
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    } else {
      return ctx.db.mutation.createCartItem(
        {
          data: {
            user: {
              connect: { id: ctx.request.userId }
            },
            item: {
              connect: { id: args.id }
            }
          }
        },
        info
      );
    }
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. find cart item
    const cartItem = await ctx.db.query.cartItem(
      { where: { id: args.id } },
      `{id, user { id }}`
    );

    if (!cartItem) {
      throw new Error("Cart item not found!");
    }

    // 2. check if cart item is owned by user
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("Access denied. You don't own the cart item");
    }

    // 3. delete cart item
    return await ctx.db.query.deleteItem({ where: { id: args.id } });
  }
};

module.exports = Mutations;
