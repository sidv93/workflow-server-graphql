'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.workflow = undefined;

var _mongodb = require('mongodb');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _graphqlServerExpress = require('graphql-server-express');

var _graphqlTools = require('graphql-tools');

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const URL = 'http://localhost';
const PORT = 3000;
const MONGO_URL = 'mongodb://localhost:27017/workflow';

const workflow = exports.workflow = async () => {
    // try {
    const client = await _mongodb.MongoClient.connect(MONGO_URL, { useNewUrlParser: true });
    const db = client.db('workflow');
    const Boards = db.collection('Boards');
    const Lists = db.collection('Lists');
    const Cards = db.collection('Cards');
    const Users = db.collection('Users');

    const typeDefs = [`
            type Board {
                boardId: String
                boardName: String
                user: String
                date: String
                createdAt: String
                updatedAt: String
            }

            type List {
                listId: String
                listName: String
                boardId: String
                createdAt: String
                updatedAt: String
            }

            type Card {
                cardData: String
                cardId: String
                listId: String
                createdAt: String
                updatedAt: String
            }

            type User {
                userId: String
                password: String
                createdAt: String
            }

            type Query {
                boards(user: String): [Board]
                lists(boardId: String): [List]
                cards(listId: String): [Card]
            }

            type Mutation {
                createBoard(boardName: String, user: String): Board
                createList(listName: String, boardId: String): List
                createCard(cardData: String, listId: String): Card
            }

            schema {
                query: Query
                mutation: Mutation
            }
        `];

    const resolvers = {
        Query: {
            boards: async (root, { user }) => {
                return await Boards.find({ user: user }).toArray();
            },
            lists: async (root, { boardId }) => {
                return await Lists.find({ boardId: boardId }).toArray();
            },
            cards: async (root, { listId }) => {
                return await Cards.find({ listId: listId }).toArray();
            }
        },
        Mutation: {
            createBoard: async (root, args, context, info) => {
                let newBoard = {
                    boardName: args.boardName,
                    user: args.user,
                    boardId: (0, _v2.default)()
                };
                const res = await Boards.insert(newBoard);
                return await Boards.findOne({ _id: res.insertedIds["0"] });
            },
            createList: async (root, args) => {
                let newList = {
                    listName: args.listName,
                    boardId: args.boardId,
                    listId: (0, _v2.default)()
                };
                const res = await Lists.insert(newList);
                return await Lists.findOne({ _id: res.insertedIds["0"] });
            },
            createCard: async (root, args) => {
                let newCard = {
                    cardData: args.cardData,
                    listId: args.listId,
                    cardId: (0, _v2.default)()
                };
                const res = await Cards.insert(newCard);
                return await Cards.findOne({ _id: res.insertedIds["0"] });
            }
        }
    };

    const schema = (0, _graphqlTools.makeExecutableSchema)({
        typeDefs,
        resolvers
    });

    const app = (0, _express2.default)();
    app.use((0, _cors2.default)());

    app.use('/graphql', _bodyParser2.default.json(), (0, _graphqlServerExpress.graphqlExpress)({ schema }));
    app.use('/graphiql', (0, _graphqlServerExpress.graphiqlExpress)({
        endpointURL: '/graphql'
    }));

    app.listen(PORT, () => {
        console.log('Server active on' + URL + ':' + PORT);
    });
    // }
    // catch(error) {
    //     console.log('Error-' + JSON.stringify(error));
    // }
};