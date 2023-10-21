const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

const poolData = {
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.CLIENT_ID,
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Promisify the sign-up function for better error handling
const signUp = (username, password, attrList) => {
  return new Promise((resolve, reject) => {
    userPool.signUp(username, password, attrList, null, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.user);
      }
    });
  });
};

// Promisify the email confirmation function
const confirmEmail = (username, code) => {
  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, false, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = { signUp, confirmEmail };

// const authenticationData = {
//   Username: "username",
//   Password: "Password1@",
// };

// const authenticationDetails = new cognito.AuthenticationDetails(
//   authenticationData
// );

// const userData = {
//   Username: "username",
//   Pool: userPool,
// };

// const cognitoUser = new cognito.CognitoUser(userData);

// cognitoUser.authenticateUser(authenticationDetails, {
//   onSuccess: (session) => {
//     console.log("Authentication successful");
//     console.log("ID Token: " + session.getIdToken().getJwtToken());
//     console.log("Access Token: " + session.getAccessToken().getJwtToken());
//     console.log("Refresh Token: " + session.getRefreshToken().getToken());
//   },
//   onFailure: (err) => {
//     console.error("Authentication failed:", err);
//   },
// });
