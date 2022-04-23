import { Collection } from "discord.js";

import { TypedEventEmitter } from "../util/typedEventEmitter";
import { ComponentId, ComponentValue, InquireComponent } from "./inquireComponent";

/**
 * 各コンポーネントの回答状態
 */
type AnswerStatus<TId extends string, TValue, T extends InquireComponent<TId, TValue>> =
  | {
      id: TId;
      state: "unanswered";
    }
  | {
      id: TId;
      state: "answered";
      value: TValue;
    }
  | {
      id: TId;
      state: "timeout";
    };

/**
 * promptの返り値
 */
type PromptResult<T extends InquireComponent<string, unknown>> = {
  [K in T["id"]]: {
    id: K;
    value: ComponentValue<Extract<T, InquireComponent<K, unknown>>>;
  };
};

type Events<TId extends string, TValue, T extends InquireComponent<TId, TValue>> = {
  answered: {
    id: TId;
    value: TValue;
  };
  rejected: {
    id: string;
    reason: string;
  };
};

export class AnswerCollector<
  TId extends string,
  TValue,
  TCollector,
  T extends InquireComponent<TId, TValue, TCollector>
> extends TypedEventEmitter<Events<TId, TValue, T>> {
  answerStatus: Collection<TId, AnswerStatus<TId, TValue, T>>;

  constructor(
    //ここの型定義ちょっと甘いけど面倒なのでこのまま
    componentWithCollectors: {
      component: T;
      collector: TCollector;
    }[]
  ) {
    super();

    const entries: [TId, AnswerStatus<TId, TValue, T>][] = componentWithCollectors.map(
      ({ component }) => {
        const key = component.id as ComponentId<T>;
        const value: AnswerStatus<TId, TValue, T> = {
          id: component.id,
          state: "unanswered",
        };
        return [key, value];
      }
    );
    this.answerStatus = new Collection(entries);

    this.hookCollectors(componentWithCollectors);
  }

  protected hookCollectors(
    componentWithCollectors: {
      component: T;
      collector: TCollector;
    }[]
  ) {
    componentWithCollectors.forEach(({ collector, component }) => {
      component.hookCollector(
        {
          answer: (value) => {
            this.answerStatus.set(component.id, {
              id: component.id,
              state: "answered",
              value: value,
            });
            this.emit("answered", {
              id: component.id,
              value: value,
            });
          },
          reject: (reason) => {
            this.emit("rejected", {
              id: component.id,
              reason: reason,
            });
          },
        },
        collector
      );
    });
  }

  public awaitAnswer<TIdOne extends ComponentId<T>>(
    id: TIdOne
  ): Promise<{
    id: TIdOne;
    value: ComponentValue<Extract<T, InquireComponent<TIdOne, TValue>>>;
  }> {
    const status = this.answerStatus.get(id);
    if (status?.state === "answered") {
      return Promise.resolve({
        id: id,
        value: status.value as ComponentValue<Extract<T, InquireComponent<TIdOne, TValue>>>,
      });
    }

    return new Promise((resolve, reject) => {
      const answerHandler = ({ id: eventId, value }: Events<TId, TValue, T>["answered"]) => {
        if (id !== eventId) return;
        resolve({
          id: id,
          value: value as ComponentValue<Extract<T, InquireComponent<TIdOne, TValue>>>,
        });
        this.off("answered", answerHandler);
      };
      this.on("answered", answerHandler);

      const rejectHandler = ({ id: eventId, reason }: Events<TId, TValue, T>["rejected"]) => {
        if (id !== eventId) return;
        reject(reason);
        this.off("rejected", rejectHandler);
      };
      this.on("rejected", rejectHandler);
    });
  }

  public awaitAllAnswer(): Promise<PromptResult<T>> {
    return Promise.all(
      this.answerStatus.map((status) => this.awaitAnswer(status.id as ComponentId<T>))
    ).then((answers) =>
      answers.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.id]: cur,
        };
      }, {} as PromptResult<T>)
    );
  }
}
