/**
 * Tの各プロパティからUを取り除く
 */
export type ExcludeProp<T, U> = {
  [P in keyof T]: Exclude<T[P], U>;
};

type _TestExcludeParam = [
  Expect<
    Equal<
      ExcludeProp<
        {
          nullableStr: string | null;
          num: number;
          null: null;
        },
        null
      >,
      {
        nullableStr: string;
        num: number;
        null: never;
      }
    >
  >
];

// ============================================================

/**
 * Tに含まれるUをVに置き換える
 */
export type ReplaceUnion<T, U, V> = T extends U ? Exclude<T, U> | V : T;

type _TestReplace = [
  Expect<Equal<ReplaceUnion<number | string, string, never>, number>>,
  Expect<Equal<ReplaceUnion<number | string, undefined, never>, number | string>>,
  Expect<
    Equal<ReplaceUnion<number | string, string, string | undefined>, number | string | undefined>
  >
];

// ============================================================

type If<T, U, V, W> = T extends U ? V : W;

/**
 * Tのプロパティの内、部分型としてUを持つものを残す
 */
type PickMayValue<T extends Record<string | number | symbol, unknown>, V> = Pick<
  T,
  {
    [P in keyof T]-?: If<T[P], V, P, never>;
  }[keyof T]
>;

type _TestPickValue = [
  Expect<Equal<PickMayValue<{ a: string; b: number }, string>, { a: string }>>,
  Expect<Equal<PickMayValue<{ a: string; b?: number }, undefined>, { b?: number }>>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Expect<Equal<PickMayValue<{ a: string; b?: number }, null>, {}>>
];

type OmitMayValue<T extends Record<string | number | symbol, unknown>, V> = Omit<
  T,
  {
    [P in keyof T]-?: If<T[P], V, P, never>;
  }[keyof T]
>;

type _TestOmitValue = [
  Expect<Equal<OmitMayValue<{ a: string; b: number }, string>, { b: number }>>,
  Expect<Equal<OmitMayValue<{ a: string; b?: number }, undefined>, { a: string }>>,
  Expect<Equal<OmitMayValue<{ a: string; b?: number }, null>, { a: string; b?: number }>>
];

/**
 * Tのプロパティの内、nullableなプロパティをoptionalにする
 */
export type SetPartialIfNullable<T extends Record<string | number | symbol, unknown>> = Expand<
  OmitMayValue<T, null> & Partial<PickMayValue<T, null>>
>;

type _TestSetPartialNullable = [
  Expect<
    Equal<
      SetPartialIfNullable<{ a: string; b: number; c: string | null; d: null }>,
      {
        a: string;
        b: number;
        c?: string | null;
        d?: null;
      }
    >
  >
];

// ============================================================

/**
 * 型定義のテスト用
 * from: https://github.com/type-challenges/type-challenges/blob/main/utils/index.d.ts
 */
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;
export type Expect<T extends true> = T;

// from: https://stackoverflow.com/questions/57683303/how-can-i-see-the-full-expanded-contract-of-a-typescript-type
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type ExpendRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpendRecursively<O[K]> }
    : never
  : T;
