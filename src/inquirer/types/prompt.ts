import type { APIActionRowComponent, APIMessageActionRowComponent } from "discord-api-types/v10";

export type Prompt<TResult> = () => {
  status: AnswerStatus<TResult>;
  component: ComponentPayload;
};

export type AnswerStatus<T> =
  | {
      status: "unanswered";
      value?: undefined;
      reason?: undefined;
    }
  | {
      status: "answered";
      value: T;
      reason?: undefined;
    }
  | {
      status: "rejected";
      value?: undefined;
      reason: string;
    };

export type ComponentPayload = APIActionRowComponent<APIMessageActionRowComponent>;
