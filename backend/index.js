require('dotenv').config();
const config = require('./config');
const appManager = require("./app");
require("./errors");
const path = require("path");
const { router } = require('./routes');
const errorHandler = require('./errors/handlers');
const prismaService = require('./services/prismaService');

// set up root path 
global.appRoot = path.resolve(__dirname);
const { port, name, version } = config.app;
const app = appManager.setup(config);

/* Route handling */
app.get('/', (req, res)=>{
    res.send({
        AppName: name,
        version 
    })
});



app.use('/api', router);


// Not Found 
app.use((req, res, next) => next(new RequestError('Invalid route', 404)));

// Global error handler
app.use(errorHandler);

// Start the database connection and server
app.listen(port, async () => {
    try {
      await prismaService.getClient().$connect();  
      console.log('Database connected successfully');
      console.log(`Server is running at http://localhost:${port}`);
    } catch (err) {
      console.error('Failed to connect to the database:', err);
    }
});
