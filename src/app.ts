import errorMiddleware from "./errorHandler/errorMiddleware";
import { Error } from "sequelize";
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const { sequelize } = require('./models/index');

app.use(express.json());
dotenv.config();


const corsOptions = {
  origin: "http://localhost:5173/",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
  optionsSuccessStatus: 204,
  credentials: true,
};
app.use(cors(corsOptions));


const connectDB = async () => {
  await sequelize.sync({ force: false })
    .then(() => {
      console.log('DB 연결 성공');
    })
    .catch((err: Error) => {
      console.error(err);
    })
}
connectDB();


const userRouter = require('./routes/users.route');
const sectorRouter = require('./routes/sectors.route');

app.use('/users', userRouter);
app.use('/sectors', sectorRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});