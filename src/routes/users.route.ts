import express, { Router } from "express";
import { addUser, addWholesaler, createNewAccessToken, getUser, login, logout, postOtp, putPwd, resetPwd, verifyOtp } from "../controllers/users.controller";
import { companyNumberValidate, loginValidate, otpCheckValidate, otpReqValidate, putPwValidate, registerValidate, resetPwValidate } from "../validators/users.validator";
import { validate } from "../validators/validate";
import { wrapAsyncController } from "../utils/wrapAsyncController";
import { accessTokenValidate, refreshTokenValidate } from "../auth";
export const router: Router = express.Router();

router.post(
    '/company-number/check',
    [companyNumberValidate, validate],
    wrapAsyncController(getUser)
);

router.post(
    '/register',
    [...registerValidate, validate],
    wrapAsyncController(addUser)
);

router.post(
    '/admin',
    [accessTokenValidate],
    wrapAsyncController(addWholesaler)
);

router.post(
    '/login',
    [...loginValidate, validate],
    wrapAsyncController(login)
);

router.post(
    '/refresh',
    [refreshTokenValidate],
    wrapAsyncController(createNewAccessToken)
);

router.post(
    '/logout',
    [refreshTokenValidate],
    wrapAsyncController(logout)
);

router.post(
    '/password_reset',
    [...resetPwValidate, validate],
    wrapAsyncController(resetPwd)
);

router.put(
    '/password_reset',
    [...putPwValidate, validate],
    wrapAsyncController(putPwd)
)

router.post(
    '/auth/otp',
    [otpReqValidate, validate],
    wrapAsyncController(postOtp)
);

router.post(
    '/auth/otp/validation',
    [...otpCheckValidate, validate],
    wrapAsyncController(verifyOtp)
);