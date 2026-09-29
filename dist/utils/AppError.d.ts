declare const AppError: {
    new (message: string, statusCode: number): {
        statusCode: number;
        status: string;
        isOperational: boolean;
        name: string;
        message: string;
        stack?: string;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace(err: Error, stackTraces: NodeJS.CallSite[]): any;
    stackTraceLimit: number;
};
export default AppError;
