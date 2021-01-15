import firebase from "firebase";
import request from "@/utils/request";

export const validateToken = async (idToken) => {
    console.log('=== REQUEST VALIDATE ===');
    let data = await request.post("http://localhost:3000/auth/validate", {
        idToken: idToken,
    });
    let customToken = data.customToken;

    console.log('=== signInWithCustomToken ===');
    let fireResponse = await firebase.auth().signInWithCustomToken(customToken);
    let newIdToken = fireResponse.user.ya;
    return newIdToken;
};

export const emailLogin = async (data) => {
    let fireResponse = await firebase
        .auth()
        .signInWithEmailAndPassword(data.email, data.password);

    console.log(fireResponse);

    //let user = fireResponse.user;
    let idToken = fireResponse.user.ya;
    return idToken;
    /*
    let customToken = await validateToken(idToken);

    return customToken;*/
};

/**
 * Signout
 */
export const logout = () => {
    return firebase
        .auth()
        .signOut();
};

/**
 * Get Personal Information
 */
export const getCurrentUser = () => {
    return request.get("/auth/current_user");
};

