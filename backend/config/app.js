
module.exports={
    name : process.env.APP_NAME || "ProjectName",
    version: "v1",
    port : process.env.APP_PORT || 800,
    secure : (process.env.NODE_ENV == 'production') || false,
    auth_identifier: "auth_user",
    salt: 10,
    secret : process.env.APP_SECRET || 'NodeJSProject',
    refreshTokenSecret : process.env.APP_REFRESH_SECRET || 'NodeJSProjectRefresh',
    jwtExpiration : process.env.JWT_EXPIRATION || '15m',
    jwtRefreshExpiration : process.env.JWT_REFRESH_EXPIRATION || '7d',
}