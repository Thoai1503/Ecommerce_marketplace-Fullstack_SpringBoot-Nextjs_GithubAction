import { Attribute } from "./attribute";
import { convertDbCategoriesToComponentFormat } from "@/helper/utils";

export interface CategoryAttribute {
  id: number;
  category_id: number;
  attribute_id: number;
  status: number;
  attribute: Attribute;
}
