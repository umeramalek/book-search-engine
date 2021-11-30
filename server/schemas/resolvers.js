const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in.');
        },
        users: async () => {
            return User.find().populate('savedBooks');
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }
            const correctPassword = await user.isCorrectPassword(password);

            if (!correctPassword) {
                throw new AuthenticationError('Incorrect password.');
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user_id },
                    { $addToSet: { savedBooks: args.content } },
                    { new: true, runValidators: true }
                )
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in.');
        },
        deleteBook: async (parent,  { bookId }, context ) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                )
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in.');
        }
    }
};

module.exports = resolvers;