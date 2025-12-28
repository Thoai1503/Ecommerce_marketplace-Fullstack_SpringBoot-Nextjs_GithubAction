import { Attribute } from "./attribute";

export interface CategoryAttribute {
  id: number;
  category_id: number;
  attribute_id: number;
  status: number;
  attribute: Attribute;
}
