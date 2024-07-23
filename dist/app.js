"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = __importDefault(require("./errorHandler/errorMiddleware"));
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
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield sequelize.sync({ force: false })
        .then(() => {
        console.log('DB 연결 성공');
    })
        .catch((err) => {
        console.error(err);
    });
});
connectDB();
const userRouter = require('./routes/users.route');
const sectorRouter = require('./routes/sectors.route');
app.use('/users', userRouter);
app.use('/sectors', sectorRouter);
app.use(errorMiddleware_1.default);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});
