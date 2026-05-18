import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { IReturnRequestAttachment } from "@/validators/returnRequestAttachment";
import { API_URL } from "@/helper/api";

const modelConfig = {
  path: `${API_URL}/api/refunds-requests-attachments`,
  modal: "return-request-attachment",
};

export class ReturnRequestAttachment extends Model {
  static queryKeys = {
    paginate: "RETURN_REQUEST_ATTACHMENTS_PAGINATE_QUERY",
    findOne: "RETURN_REQUEST_ATTACHMENTS_FIND_ONE_QUERY",
  };
  static object = ObjectsFactory.factory<IReturnRequestAttachment>(
    modelConfig,
    this.queryKeys,
  );

  static getByReturnRequestId(returnRequestId: number) {
    return {
      queryKey: [
        "RETURN_REQUEST_ATTACHMENTS_BY_RETURN_REQUEST_ID_QUERY",
        returnRequestId,
      ],
      queryFn: (): Promise<IReturnRequestAttachment[]> =>
        this.api
          .get<IReturnRequestAttachment[]>({
            url: `${this.path}/${returnRequestId}/attachments`,
          })
          .then((r) => {
            console.log("API response for getByReturnRequestId:", r.data);
            return r.data;
          })
          .catch((error) => {
            console.warn("No return request attachments found:", error);
            return [];
          }),
    };
  }
}
