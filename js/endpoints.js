export const baseEndpoint = "https://dolphin-app-nxbr6.ondigitalocean.app/api/v1";

export const commonEndpoints = {
    checkAuth: `${baseEndpoint}/checktoken`,
    logout: `${baseEndpoint}/logout`
};

export const studentEndpoints = {
    joinSession: `${baseEndpoint}/joinsession`,
    getQuestion: `${baseEndpoint}/retrivequestion`,
    sendAnswer: `${baseEndpoint}/recieveanswer`
}

export const adminStatsEndpoints = {
    userStats: `${baseEndpoint}/`,
    generalStats: `${baseEndpoint}/`
}