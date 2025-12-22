export type CodeModalOptions = {
  validate: (code: string) => boolean | Promise<boolean>
}
