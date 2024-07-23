import express, { Router } from "express";
import getSectors from "../controllers/sectors.controller";
export const router: Router = express.Router();

router.get(
    '/',
    getSectors
);