// @types/url-regex-safeのが間違ってるので書いた

declare module "url-regex-safe" {
  type Options = Partial<{
    exact: boolean;
    strict: boolean;
    auth: boolean;
    localhost: boolean;
    parens: boolean;
    apostrophes: boolean;
    trailingPeriod: boolean;
    ipv4: boolean;
    ipv6: boolean;
    tlds: string[];
    returnString: boolean;
  }>;
  type OptionsWithoutReturnString = Omit<Options, "returnString">;

  declare function createUrlRegExp(
    options: OptionsWithoutReturnString & { returnString: true }
  ): string;
  declare function createUrlRegExp(options?: Options): RegExp;

  export = createUrlRegExp;
}
