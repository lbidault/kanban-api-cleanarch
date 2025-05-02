import { v4 } from "uuid";
import { IdGateway } from "../../../gateways/IdGateway";

export class V4IdGateway implements IdGateway {
  generate(): string {
    return v4();
  }
}
