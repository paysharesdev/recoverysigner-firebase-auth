import { Dispatch } from "redux";

import {
  SEND_VERIFICATION_EMAIL,
  sendVerificationEmail as action,
} from "ducks/firebase";
import { buildStatus } from "helpers/buildStatus";
import { getFirebaseError } from "helpers/getFirebaseError";
import { DynamicLinkSettings } from "types.d/AppConfig";
import { StatusType } from "types.d/Status";

interface SendVerificationEmailParams {
  email: string;
  dynamicLinkSettings: DynamicLinkSettings;
  dispatch: Dispatch;
}

export async function sendVerificationEmail({
  email,
  dynamicLinkSettings,
  dispatch,
}: SendVerificationEmailParams) {
  const setStatus = buildStatus(SEND_VERIFICATION_EMAIL, dispatch);
  setStatus(StatusType.loading);

  const { referrerId, domain, path } = dynamicLinkSettings;
  const dynamicLinkConfig = {
    android: { installApp: true, packageName: referrerId },
    domain: `${domain}`,
    handleCodeInApp: true,
    iOS: { bundleId: referrerId },
    url: `https://${domain}/${path}`,
  };

  firebase
    .auth()
    .sendSignInLinkToEmail(email, dynamicLinkConfig)
    .then(() => {
      dispatch(action());
      setStatus(StatusType.success);
    })
    .catch((error) => {
      const message = getFirebaseError(error);

      setStatus(StatusType.error, new Error(message));
    });
}
