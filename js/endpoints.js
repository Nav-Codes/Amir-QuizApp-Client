//ChatGPT was used to fix minor bugs with this code

export const baseEndpoint = "https://dolphin-app-nxbr6.ondigitalocean.app/api/v1";

export const commonEndpoints = {
    checkAuth: `${baseEndpoint}/checktoken`,
    logout: `${baseEndpoint}/logout`,
    singleAPIUsage: `${baseEndpoint}/apiSingleUserUsage`
};

export const studentEndpoints = {
    joinSession: `${baseEndpoint}/joinsession`,
    getQuestion: `${baseEndpoint}/retrivequestion`,
    sendAnswer: `${baseEndpoint}/recieveanswer`
}

export const adminStatsEndpoints = {
    userStats: `${baseEndpoint}/apiUserUsage`,
    generalStats: `${baseEndpoint}/apiEndpointUsage`
}