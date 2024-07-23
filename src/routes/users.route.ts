import express, { Router } from "express";
import { addUser } from "../controllers/users.controller";
import { registerValidate } from "../validators/users.validator";
import { validate } from "../validators/validate";
export const router: Router = express.Router();

router.post(
    '/register',
    [...registerValidate, validate],
    addUser
);