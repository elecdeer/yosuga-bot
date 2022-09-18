import type { APIActionRowComponent, APIMessageActionRowComponent } from "discord-api-types/v10";

export type Prompt<TResult> = () => {
  status: AnswerStatus<TResult>;
  component: ComponentPayload;
};

export type AnswerStatus<T> =
  | {
      condition: "unanswered";
      value?: undefined;
      reason?: undefined;
    }
  | {
      condition: "answered";
      value: T;
      reason?: undefined;
    }
  | {
      condition: "rejected";
      value?: undefined;
      reason: string;
    };

export type ComponentPayload = APIActionRowComponent<APIMessageActionRowComponent>;
