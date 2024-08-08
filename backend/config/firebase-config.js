import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import serviceAccount from "./serviceAccount.json" assert { type: "json" };

const app = initializeApp({
  credential: cert(serviceAccount)
});


const auth = getAuth(app);
export default auth;
