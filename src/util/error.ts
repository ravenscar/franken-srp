export class SRPError extends Error {
  public status: number;
  public action: string;
  public detail: object;

  constructor(message: string, status: number, action: string, detail: object) {
    super(message);
    this.name = "SRPError";
    this.status = status;
    this.action = action;
    this.detail = detail;
  }

  toString() {
    return JSON.stringify(
      {
        name: this.name,
        message: this.message,
        stack: this.stack,
        status: this.status,
        action: this.action,
        detail: this.detail,
      },
      null,
      2
    );
  }
}
