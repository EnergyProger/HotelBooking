import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config";
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_CONNECTION as string);

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get('/api/test', async (req: Request, res: Response) =>{
  res.json({message: "Hello world"});
});

app.listen(process.env.SERVER_PORT, ()=>{
  console.log(`The server runs on port ${process.env.SERVER_PORT}`);
});
