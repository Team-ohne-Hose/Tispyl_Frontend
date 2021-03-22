export class APIResponse<P> {
  success: boolean;
  payload: P;
  errors: any[];
}
