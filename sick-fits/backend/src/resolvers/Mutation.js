const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transporter, resetPasswordTemplate } = require("../mailer");

const Mutations = {
  createDog(parent, args, ctx, info) {
    global.dogs = global.dogs || [];
    const newDog = { name: args.name };
    global.dogs.push(newDog);
    return newDog;
  },
  async createItem(parent, args, ctx, info) {
    const { title, description, price, image, largeImage } = args.data;
    console.log(args);

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          title,
          description,
          price,
          image,
          largeImage
        }
      },
      info // backend needs to access 'prisma query' info  for actual query
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
    console.log(args);
    const { where } = args;
    //1. Find the item
    const item = await ctx.db.query.item({ where }, `{id, title}`);
    // 2. Check if they own that item, or have the permissions
    // TODO
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
  }
};

module.exports = Mutations;
