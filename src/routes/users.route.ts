import express, { Router } from "express";
import { addUser, postOtp, verifyOtp } from "../controllers/users.controller";
import { otpCheckValidate, otpReqValidate, registerValidate } from "../validators/users.validator";
import { validate } from "../validators/validate";
export const router: Router = express.Router();

router.post(
    '/register',
    [...registerValidate, validate],
    addUser
);

router.post(
    '/auth/otp',
    [...otpReqValidate, validate],
    postOtp
);

router.post(
    '/auth/otp/validation',
    [...otpCheckValidate, validate],
    verifyOtp
);