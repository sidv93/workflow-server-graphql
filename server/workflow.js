import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import uuidv4 from 'uuid/v4';


const URL = 'http://localhost';
const PORT = 3000;
const MONGO_URL = 'mongodb://localhost:27017/workflow';

export const workflow = async () => {
    try {
        const client = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true });
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
                auth(userId: String, password: String): User
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
                boards: async (root, {user}) => {
                    return await Boards.find({user: user}).toArray();
                },
                lists: async (root, {boardId}) => {
                    return await Lists.find({boardId: boardId}).toArray();
                },
                cards: async (root, {listId}) => {
                    return await Cards.find({listId: listId}).toArray();
                },
                auth: async (root, {userId, password}) => {
                    let res = await Users.findOne({userId: userId, password: password}, { projection : {password: 0 }});
                    console.log('login res=' + JSON.stringify(res));
                    return res;                   
                }
            },
            Mutation: {
                createBoard: async (root, args, context, info) => {
                    let newBoard = {
                        boardName: args.boardName,
                        user: args.user,
                        boardId: uuidv4()
                    }
                    const res = await Boards.insert(newBoard);
                    return await Boards.findOne({_id: res.insertedIds["0"]})
                },
                createList: async (root, args) => {
                    let newList = {
                        listName: args.listName,
                        boardId: args.boardId,
                        listId: uuidv4()
                    };
                    const res = await Lists.insert(newList);
                    return await Lists.findOne({_id: res.insertedIds["0"]});
                },
                createCard: async (root, args) => {
                    let newCard = {
                        cardData: args.cardData,
                        listId: args.listId,
                        cardId: uuidv4()
                    };
                    const res = await Cards.insert(newCard);
                    return await Cards.findOne({_id: res.insertedIds["0"]});
                }
            }
        };

        const schema = makeExecutableSchema({
            typeDefs,
            resolvers
        });

        const app = express();
        app.use(cors());

        app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));
        app.use('/graphiql', graphiqlExpress({
            endpointURL: '/graphql'
        }));

        app.listen(PORT, () => {
            console.log('Server active on' + URL + ':' + PORT);
        });
    }
    catch(error) {
        console.log('Error-' + JSON.stringify(error));
    }
}