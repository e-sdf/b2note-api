import { Request, Response, Router } from "express";
import passport from "passport";
import { logError } from "../logging";
import * as responses from "../responses";
import * as profile from "../core/profile";
import * as validator from "../validators/profile";
import * as db from "../db/users";

const router = Router();

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
          console.log(req.user);
          responses.ok(resp);
          // const userId: string = req.user?.id;
          // if (!userId) {
          //   logError("Something is wrong, no user in request.");
          //   responses.serverErr(resp, "Internal server error");
          // } else {
          //   db.updateUserProfile(userId, changes)
          //   .then(modified => {
          //       if (modified > 0) { // operation successful 
          //         responses.ok(resp);
          //       } else { // annotation not found
          //         logError("Something is wrong, user id=" + userId + "not found in DB.");
          //         responses.serverErr(resp, "Internal server error")
          //       }
          //     }
          //   )
          //   .catch(err => responses.serverErr(resp, err, "Internal server error"));
          // }
        }
      }
    }
  });


export default router;