import request from "@/utils/request";

/**
 * login
 * @param data login form data
 */
export const login = (data) => {
  return request.post("/rest/authenticate", data);
};

/**
 * Signout
 */
export const logout = () => {
  return request.post("/rest/logout");
};

/**
 * Get Personal Information
 */
export const getCurrentUser = () => {
  return request.get("/rest/users/current");
};

/**
 * Get Access Logs
 * @param {*} user_id User ID
 */
export const getAccessLogsByUserId = (user_id) => {
  return request.get("/rest/access/log", {
    params: {
      user_id: user_id,
      sortDesc: ["createTime"],
      pageSize: 5,
      resourceType: [0, 1, 2],
    },
  });
};

/**
 * Save personal information
 */
export const saveUserProfile = (data) => {
  return request.post("/rest/users/profile", data);
};

/**
 * Change Password
 */
export const updatePassword = (data) => {
  return request.post("/rest/users/password", data);
};
