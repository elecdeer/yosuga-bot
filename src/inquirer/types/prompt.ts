import type { APIActionRowComponent, APIMessageActionRowComponent } from "discord-api-types/v10";

export type Prompt<TResult> = (customId: string) => {
  result: AnswerState<TResult>;
  component: ComponentPayload;
};

export type AnswerState<T> =
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
