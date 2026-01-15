import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcError } from '../interfaces/rpc-error.interface';
import { isRpcError } from '../guards/rpc-error.guard';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException): RpcError {
    const error = exception.getError();

    this.logger.error(error);

    if (isRpcError(error)) {
      return error;
    }

    if (typeof error === 'string') {
      return {
        status: 400,
        message: error,
      };
    }

    return {
      status: 500,
      message: 'Internal microservice error',
    };
  }
}
