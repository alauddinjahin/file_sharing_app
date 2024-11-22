

const errorHandler = (error, req, res, next) => {

    if (!(error instanceof RequestError)) {
      error = new RequestError('Some Error Occurred', 500, error.message);
    }

    const {status, errorMessage } = error;
    res.status(error.status || 500).json({ status, errorMessage });

}


module.exports = errorHandler