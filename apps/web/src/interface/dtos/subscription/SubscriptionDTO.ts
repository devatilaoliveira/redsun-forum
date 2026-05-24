import {ESubscriptionPlan} from "../../enums/ESubscriptionPlan";

export interface SubscriptionDTO {
  id: string | null;
  plan: ESubscriptionPlan;
}
