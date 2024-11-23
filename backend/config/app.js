
module.exports={
    name : process.env.APP_NAME || "ProjectName",
    version: "v1",
    port : process.env.APP_PORT || 800,
    secret : process.env.APP_SECRET || 'NodeJSProject',
    secure : (process.env.NODE_ENV == 'production') || false,
    auth_identifier: "auth_user",
    salt: 10,
}