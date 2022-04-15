export class TransactionNullableValueError extends Error {
  public sender: string;
  public recipient: string;
  public reason: string;

  constructor(sender: string, recipient: string, reason: string) {
    super(
      `Transaction from ${sender} to ${recipient} for reason ${reason} is not 0 value`
    );
    this.sender = sender;
    this.recipient = recipient;
    this.reason = reason;
  }
}

export class TransactionOverflowError extends Error {
  public sender: string;
  public recipient: string;
  public reason: string;

  constructor(sender: string, recipient: string, reason: string) {
    super(
      `Transaction from ${sender} to ${recipient} for reason ${reason} is overflowed block`
    );
    this.sender = sender;
    this.recipient = recipient;
    this.reason = reason;
  }
}
export class TransactionStorageRewardPassError extends Error {
  public sender: string;
  public recipient: string;
  public reason: string;

  constructor(sender: string, recipient: string, reason: string) {
    super(
      `Transaction from ${sender} to ${recipient} for reason ${reason} is passed storage reward`
    );
    this.sender = sender;
    this.recipient = recipient;
    this.reason = reason;
  }
}

export class TransactionIsNoValidBlock extends Error {
  public sender: string;
  public recipient: string;
  public reason: string;

  constructor(sender: string, recipient: string, reason: string) {
    super(
      `Transaction from ${sender} to ${recipient} for reason ${reason} is no valid last hash block`
    );
    this.sender = sender;
    this.recipient = recipient;
    this.reason = reason;
  }
}

export class TransactionLessBalanceError extends Error {
  public sender: string;
  public recipient: string;
  public reason: string;
  public senderBalance: number;
  public transactionBalance: number;

  constructor(
    sender: string,
    senderBalance: number,
    transactionBalance: number,
    recipient: string,
    reason: string
  ) {
    super(
      `User ${sender} balance ${senderBalance} is less than transaction balance ${transactionBalance}`
    );
    this.sender = sender;
    this.recipient = recipient;
    this.reason = reason;
    this.senderBalance = senderBalance;
    this.transactionBalance = transactionBalance;
  }
}
export class TransactionNoValidError extends Error {
  constructor() {
    super(`Transactions is no valid `);
  }
}
