import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';


const URL = 'http://localhost';
const PORT = 3000;
const MONGO_URL = 'mongodb://localhost:27017/workflow';

export const workflow = async () => {
    // try {
        const client = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true });
        const db = client.db('asteria');
        const Boards = db.collection('Boards');
        const Lists = db.collection('Lists');
        const Cards = db.collection('Cards');
        const Users = db.collection('Users');

        const typeDefs = [`

        `];

        const resolvers = {
            
        };

        const schema = makeExecutableSchema({
            typeDefs,
            resolvers
        });

        const app = express();
        app.use(cors());

        app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));
        app.use('graphiql', graphiqlExpress({
            endpointURL: '/graphql'
        }));

        app.listen(PORT, () => {
            console.log('Server active on ${URL}:${PORT}');
        });
    // }
    // catch(error) {
    //     console.log('Error-' + JSON.stringify(error));
    // }
}