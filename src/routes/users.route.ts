import express, { Router } from "express";
import { addUser } from "../controllers/users.controller";
export const router: Router = express.Router();

router.post(
    '/register',
    [],
    addUser
);