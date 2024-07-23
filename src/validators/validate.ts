import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
export const validate = (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);

    if (err.isEmpty()) {
        return next();
    } else {
        return res.status(400).json(err.array());
    }
}