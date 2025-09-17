export type ErrorType = 'NOT_FOUND'
    | 'FORBIDDEN'
    | 'UNAUTHORIZED'
    | 'BAD_REQUEST'
    | 'INTERNAL_ERROR'
    | 'VALIDATION_ERROR'
    | 'CONFLICT';


class AppError extends Error {
    type: ErrorType;
    static ErrorMappings = (errorType: ErrorType): number => {
        switch (errorType) {
            case "NOT_FOUND":
                return 404;
            case "FORBIDDEN":
                return 403;
            case "UNAUTHORIZED":
                return 401;
            case "BAD_REQUEST":
                return 400;
            case "VALIDATION_ERROR":
                return 422;
            case "CONFLICT":
                return 409;
            case "INTERNAL_ERROR":
                return 500;
            default:
                return 500;
        }
    }

    constructor(message: string | undefined, type: ErrorType) {
        super(message);
        this.type = type;
    }

    getHttpStatusCode() {
        return AppError.ErrorMappings(this.type);
    };

}

export default AppError;