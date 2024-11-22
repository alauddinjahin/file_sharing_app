import('stack-trace').then(stackTrace => {
 
    global.RequestError = class RequestError extends Error {
        
        constructor(message, code = 500, realError = null) {

            if (realError instanceof RequestError) {
                super(realError.message, realError.code);
                this.copyObject(realError);
                return;
            }
            
            super(message, code);
            this.status = code;
            this.errorMessage = Array.isArray(message) ? message[0] : message;

            this.captureStackTrace(realError);
        }

        copyObject(requestError) {
            this.errorMessage = requestError.errorMessage;
        }

        captureStackTrace(realError) {
            const trace = stackTrace.get();
            const consoleMessage = realError || this.message;

            console.error(
                '\x1b[31mRequestError\x1b[0m',
                '\x1b[35m' + trace[1].getFileName().replace(__dirname, '') + '\x1b[0m',
                '\x1b[32m' + trace[1].getLineNumber() + ':' + trace[1].getColumnNumber() + '\x1b[0m',
                consoleMessage
            );
        }
    };
}).catch(err => {
    console.error('Error loading stack-trace:', err);
});
