export class APIResponse<P> {
  success: boolean;
  payload: P;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any[];
}
