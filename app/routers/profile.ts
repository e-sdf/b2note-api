import { Request, Response, Router } from "express";
import passport from "passport";
import { User } from "../core/user";
import * as responses from "../responses";
import * as profile from "../core/user";
import * as validator from "../validators/profile";
import * as dbUsers from "../db/users";

const router = Router();

// Get profile
router.get(profile.profileUrl, passport.authenticate("bearer", { session: false }),
  (req: Request, resp: Response) => {
    const userId: string = (req.user as User)?.id;
    if (!userId) {
      responses.serverErr(resp, "Something is wrong, no user in request.");
    } else {
      dbUsers.getUserProfileById(userId)
      .then(userProfile => {
        if (userProfile) {
          responses.ok(resp, userProfile);
        } else {
          responses.notFound(resp);
        }
      })
      .catch(err => responses.serverErr(resp, err));
    }
  }
);

// Edit profile
router.patch(profile.profileUrl, passport.authenticate("bearer", { session: false }),
  (req: Request, resp: Response) => {
    const errors = validator.validateUserProfileOpt(req.body);
    if (errors) {
      responses.clientErr(resp, errors);
    } else {
      const changes = req.body as Record<keyof profile.UserProfile, string>;
      if (changes.name) {
        responses.clientErr(resp, { errors: "name is given by B2ACCESS and cannot be updated" });
      } else {
        if (changes.email) {
          responses.clientErr(resp, { errors: "email is given by B2ACCESS and cannot be updated" });
        } else {
          const userId: string = (req.user as User)?.id;
          if (!userId) {
            responses.serverErr(resp, "Something is wrong, no user in request.");
          } else {
            dbUsers.updateUserProfile(userId, changes)
            .then(modified => {
                if (modified > 0) { // operation successful 
                  dbUsers.getUserProfileById(userId)
                  .then(mbNewProfile => {
                    if (mbNewProfile) {
                      responses.ok(resp, mbNewProfile);
                    } else {
                      responses.serverErr(resp, "User profile not found, this is weird.");
                    }
                  })
                  .catch(err => responses.serverErr(resp, err));
                } else { // profile not updated
                  responses.serverErr(resp, "Something went wrong, user profile id=" + userId + " was not updated");
                }
              }
            )
            .catch(err => responses.serverErr(resp, err));
          }
        }
      }
    }
  });


export default router;