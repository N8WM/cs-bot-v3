export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

/**
 * Functional helpers for working with Result.
 */
export const Result = {
  /**
   * Create a successful result.
   * @param value The payload.
   */
  ok: <T, E = never>(value: T): Result<T, E> => ({ ok: true, value }),

  /**
   * Create an error result.
   * @param error The error payload.
   */
  err: <T = never, E = string>(error: E): Result<T, E> => ({ ok: false, error }),

  /**
   * If the result is Ok, transform its value with `fn`.
   * Otherwise propagate the original Err.
   */
  map: <T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
    r.ok ? Result.ok<U, E>(fn(r.value)) : (r as Err<E>),

  /**
   * If the result is Err, transform its error with `fn`.
   * Otherwise propagate the original Ok.
   */
  mapErr: <T, E, F>(r: Result<T, E>, fn: (e: E) => F): Result<T, F> =>
    r.ok ? (r as Ok<T>) : Result.err<T, F>(fn(r.error)),

  /**
   * Chain a fallible computation that returns a Result.
   * If `r` is Ok, calls `fn` with its value; otherwise returns the Err.
   */
  andThen: <T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> =>
    r.ok ? fn(r.value) : (r as Err<E>),

  /**
   * Unwrap the value if Ok, otherwise return `fallback`.
   */
  unwrapOr: <T, E>(r: Result<T, E>, fallback: T): T =>
    r.ok ? r.value : fallback,

  /**
   * Unwrap the value if Ok, otherwise throw with the provided message.
   */
  expect: <T, E>(r: Result<T, E>, msg: string): T => {
    if (r.ok) return r.value;
    throw new Error(`${msg}: ${String(r.error)}`);
  },
};
