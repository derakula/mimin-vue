import request from "../utils/request";

/**
 * getDataScopes
 */
export const getDataScopes = () => {
    return request.get("/rest/scopes");
};

//getScopeTypes
export const getScopeTypes = ()=>{
    return request.get("/rest/scopes/types")
};

/**
 * getOperationByKey
 * @param menuId
 */
export const getOperationByKey = (menuId) => {
    return request.get(`/rest/menus/operation/${menuId}`);
};
