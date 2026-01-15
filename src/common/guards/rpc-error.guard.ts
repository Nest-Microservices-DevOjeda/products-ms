// rpc-error.guard.ts
import { RpcError } from '../interfaces/rpc-error.interface';

export function isRpcError(value: unknown): value is RpcError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value &&
    typeof (value as RpcError).status === 'number' &&
    typeof (value as RpcError).message === 'string'
  );
}
