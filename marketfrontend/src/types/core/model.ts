import { ApiService, IServiceConstructorData } from "./api";

export class Model {
  static api: ApiService;
  static path: string;
  static area: string;

  static setup(
    modelConfig: IServiceConstructorData = {
      path: "",
    },
  ) {
    const { path, baseUrl, getTokenFn } = modelConfig;

    this.api = new ApiService({
      path,
      baseUrl: baseUrl,
      // || appConfig.apiEndpoint,
      getTokenFn: getTokenFn,
      // || getAdminTokenFn,
    });
    this.path = path;
  }
}
