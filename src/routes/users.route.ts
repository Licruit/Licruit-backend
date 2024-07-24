import express, { Router } from "express";
import { addUser, createNewAccessToken, login, logout, postOtp, verifyOtp } from "../controllers/users.controller";
import { loginValidate, otpCheckValidate, otpReqValidate, registerValidate } from "../validators/users.validator";
import { validate } from "../validators/validate";
import { wrapAsyncController } from "../utils/wrapAsyncController";
import { accessTokenValidate, refreshTokenValidate } from "../auth";
export const router: Router = express.Router();

router.post(
    '/register',
    [...registerValidate, validate],
    wrapAsyncController(addUser)
);

router.post(
    '/login',
    [...loginValidate, validate],
    wrapAsyncController(login)
)

router.post(
    '/refresh',
    [refreshTokenValidate],
    createNewAccessToken
)

router.post(
    '/logout',
    [],
    logout
)

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