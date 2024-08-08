import express, { Router } from 'express';
import {
  addUser,
  addWholesaler,
  createNewAccessToken,
  getProfile,
  getUser,
  login,
  logout,
  postOtp,
  putPwd,
  removeUser,
  resetPwd,
  updateProfile,
  uploadProfileImg,
  verifyOtp,
} from '../controllers/users.controller';
import {
  changePwValidate,
  companyNumberValidate,
  loginValidate,
  otpCheckValidate,
  otpReqValidate,
  profileValidate,
  registerValidate,
  resetPwValidate,
  uploadImgValidate,
  withdrawalValidate,
} from '../validators/users.validator';
import { validate } from '../validators/validate';
import { wrapAsyncController } from '../utils/wrapAsyncController';
import { accessTokenValidate, refreshTokenValidate, verifyTokenValidate } from '../auth';
import { imageUploader } from '../utils/aws';
export const router: Router = express.Router();

router.post('/company-number/check', [companyNumberValidate, validate], wrapAsyncController(getUser));

router.post('/register', [...registerValidate, validate], wrapAsyncController(addUser));

router.post('/admin', [accessTokenValidate], wrapAsyncController(addWholesaler));

router.post('/login', [...loginValidate, validate], wrapAsyncController(login));

router.post('/refresh', [refreshTokenValidate], wrapAsyncController(createNewAccessToken));

router.post('/logout', [refreshTokenValidate], wrapAsyncController(logout));

router.post('/password-reset', [...resetPwValidate, validate], wrapAsyncController(resetPwd));

router.put('/password-reset', [...changePwValidate, validate], wrapAsyncController(putPwd));

router.post('/auth/otp', [otpReqValidate, validate], wrapAsyncController(postOtp));

router.post('/auth/otp/validation', [...otpCheckValidate, validate], wrapAsyncController(verifyOtp));

router.get('/profile', [accessTokenValidate], wrapAsyncController(getProfile));

router.put('/profile', [accessTokenValidate, ...profileValidate, validate], wrapAsyncController(updateProfile));

router.put(
  '/profile/img',
  [accessTokenValidate, imageUploader.single('image'), uploadImgValidate, validate],
  wrapAsyncController(uploadProfileImg),
);

router.delete('/withdrawal', [accessTokenValidate, ...withdrawalValidate, validate], wrapAsyncController(removeUser));
