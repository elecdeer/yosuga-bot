declare module "tiny-segmenter" {
  declare class TinySegmenter {
    constructor();

    public segment(input: string): string[];
    public segment(input: null | undefined): string[];
  }

  export = TinySegmenter;
}
