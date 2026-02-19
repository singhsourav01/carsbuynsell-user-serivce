import { ApiError } from "common-microservices-utils";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SUBSCRIPTION_ERRORS } from "../constants/subscription.constant";
import SubscriptionRepository from "../repositories/subscription.repository";

const subscriptionRepository = new SubscriptionRepository();

/**
 * Middleware that checks if the authenticated user has an active subscription.
 * Attach after authUser() middleware.
 */
export const requireSubscription = () => {
    return async (req: any, res: Response, next: NextFunction) => {
        try {
            const { user_id } = req.user;
            const subscription = await subscriptionRepository.findActiveByUserId(user_id);
            if (!subscription) {
                return next(
                    new ApiError(StatusCodes.FORBIDDEN, SUBSCRIPTION_ERRORS.SUBSCRIPTION_NOT_FOUND)
                );
            }
            (req as any).subscription = subscription;
            next();
        } catch (err) {
            next(err);
        }
    };
};
