const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const expressSanitizer = require('express-sanitizer');
const cors = require('cors');


module.exports = {

    setup: ( config ) => {
        const app = express();
      
        // origin: 'http://localhost:3000',  // Replace with your frontend domain if different
        // app.use(cors(corsOptions));

        app.use(cors({
            origin:true,
            credentials:true
        }));
        
        app.options('*', cors());

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(cookieParser(config.app.secret));

        // app.use(session({ secret: config.app.secret ,resave: true, saveUninitialized:true}));
        // app.use("/photo", express.static(path.join(__dirname, 'public/images')));

        app.use(expressSanitizer());
        app.use(helmet());
        app.use(helmet.hsts({
            maxAge: 0
        }))

        return app;
    }

}