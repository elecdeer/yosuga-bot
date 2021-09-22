export type Result<T, E> = Success<T> | Failure<E>;

export const success = <T>(value: T): Success<T> => {
  return new Success(value);
};

export const failure = <T>(error: T): Failure<T> => {
  return new Failure(error);
};

class Success<T> {
  constructor(readonly value: T) {}
  type = "success" as const;
  isSuccess(): this is Success<T> {
    return true;
  }
  isFailure(): this is Failure<T> {
    return false;
  }
}

class Failure<E> {
  constructor(readonly value: E) {}
  type = "failure" as const;
  isSuccess(): this is Success<E> {
    return false;
  }
  isFailure(): this is Failure<E> {
    return true;
  }
}
