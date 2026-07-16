import prisma from "../lib/prisma.js";
import { getMessaging } from "firebase-admin/messaging";
import "../config/firebase.js";


async function sendPushToUser(userId, { title, body, data = {} }) {

  const tokens = await prisma.pushToken.findMany({
    where: {
      userId
    }
  });


  if (tokens.length === 0) {
    return {
      message: "There is not tokens",
      successCount: 0,
      failureCount: 0
    };
  }


  let successCount = 0;
  let failureCount = 0;


  for (const pushToken of tokens) {

    try {

      await getMessaging().send({

        token: pushToken.token,

        notification: {
          title,
          body
        },

        data,

        webpush: {
          fcmOptions: {
            link: data.url || "/"
          }
        }

      });


      successCount++;


    } catch(err) {

      failureCount++;


      const code = err.errorInfo?.code;


      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {

        await prisma.pushToken.delete({
          where:{
            token: pushToken.token
          }
        });

      }

    }

  }


  return {
    successCount,
    failureCount
  };

}


export default sendPushToUser;