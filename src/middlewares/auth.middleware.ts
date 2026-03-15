import {
  API_ERRORS,
  AUTH_SERVICE,
  // JWKS_FOLDER,
  ROLES,
  STRINGS,
} from "../constants/app.constant";
import { NextFunction } from "express";
import { GetVerificationKey, expressjwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { Role } from "@prisma/client";

export const authUser = () => {
  console.log("AUTH_SERVICE URL:", AUTH_SERVICE);
  return (req: any, res: any, next: NextFunction) => {
    return expressjwt({
      secret: expressJwtSecret({
        jwksUri: AUTH_SERVICE ,
        cache: true,
        rateLimit: true,
      }) as GetVerificationKey,
      algorithms: ["RS256"],
      requestProperty: STRINGS.USER,
    })(req, res, (err) => {
      if (err) return next(err);
      console.log("Authenticated user:", req.user);
      console.log("User role:", req.user?.role, ROLES.USER);
      if (req.user?.role !== ROLES.USER) {
        return next(
          new ApiError(
            StatusCodes.UNAUTHORIZED,
            API_ERRORS.YOU_DO_NOT_HAVE_PERMISSION
          )
        );
      }
      next();
    });
  };
};

export const authAdmin = () => {
  return (req: any, res: any, next: NextFunction) => {
    return expressjwt({
      secret: expressJwtSecret({
        jwksUri: AUTH_SERVICE ,
        cache: true,
        rateLimit: true,
      }) as GetVerificationKey,
      algorithms: ["RS256"],
      requestProperty: STRINGS.USER,
    })(req, res, (err) => {
      if (err) return next(err);
      if (
        req.user?.role !== ROLES.ADMIN &&
        req.user?.role !== Role.SUPER_ADMIN
      ) {
        return next(
          new ApiError(
            StatusCodes.UNAUTHORIZED,
            API_ERRORS.YOU_DO_NOT_HAVE_PERMISSION
          )
        );
      }
      next();
    });
  };
};

export const auth = () => {
  return (req: any, res: any, next: NextFunction) => {
    return expressjwt({
      secret: expressJwtSecret({
        jwksUri: AUTH_SERVICE ,
        cache: true,
        rateLimit: true,
      }) as GetVerificationKey,
      algorithms: ["RS256"],
      requestProperty: STRINGS.USER,
    })(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
};
