import type { Request, Response } from "express";
import { Router } from "express";
import passport from "passport";
import type { UserProfile } from "../core/user";
import { ErrorCodes } from "../responses";
import * as responses from "../responses";
import * as profile from "../core/user";
import * as validator from "../validators/profile";
import * as dbUsers from "../db/users";

const router = Router();

// Get profile
router.get(profile.profileUrl, passport.authenticate("bearer", { session: false }),
  (req: Request, resp: Response) => {
    if (!req.user) {
      responses.serverErr(resp, "No user in request", true);
    } else {
      const userProfile = req.user as UserProfile;
      responses.ok(resp, userProfile);
    }
  }
);

// Edit profile
router.patch(profile.profileUrl, passport.authenticate("bearer", { session: false }), (req: Request, resp: Response) => {
  const errors = validator.validateUserProfileOpt(req.body);
  if (errors) {
    responses.reqErr(resp, errors);
  } else {
    const changes = req.body as Partial<UserProfile>;
    if (changes.id) {
      responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "id is persistent and cannot be updated");
    } else if (changes.email) {
      responses.clientErr(resp, ErrorCodes.REQ_FORMAT_ERR, "email is given by OAUTH and cannot be updated");
    } else if (!req.user) {
      responses.serverErr(resp, "No user in request", true);
    } else {
      const userRecord = req.user as UserProfile;
      dbUsers.updateUserProfile(userRecord.email, changes).then(
        modified => {
          if (modified > 0) { // operation successful 
            dbUsers.getUserProfileByEmail(userRecord.email)
            .then(mbNewProfile => {
              if (mbNewProfile) {
                responses.ok(resp, mbNewProfile);
              } else {
                responses.serverErr(resp, "User profile is missing");
              }
            })
            .catch(err => responses.serverErr(resp, err));
          } else { // profile not updated
            responses.serverErr(resp, "Something went wrong, user " + userRecord.email + " was not updated", true);
          }
        }
     )
     .catch(err => responses.serverErr(resp, err, true));
    }
  }
});

export default router;