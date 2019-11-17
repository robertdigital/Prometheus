import { OrderParams, Account } from "coinbase-pro";

export class Evaluation {
  public date: Date;
  public accountState: AccountState;
  public price: number;
  public indicators: Indicators;
  public order: OrderParams | null;

  constructor() {
    this.date = new Date();
  }
}

export class Indicators {
  public macd: number;
  public macdSignal: number;
  public prevMacd: number;
  public prevMacdSignal: number;
  public macdGTSignal: boolean;
  public convergingMacdSignal: boolean;
  public macdCrossoverSignal: boolean;

  constructor(macD: number, signal: number, prevIndicators?: Indicators) {
    this.macd = macD;
    this.macdSignal = signal;
    this.macdGTSignal = macD > signal;
    if (prevIndicators) {
      if (prevIndicators.macd && prevIndicators.macdSignal) {
        this.prevMacd = prevIndicators.macd;
        this.prevMacdSignal = prevIndicators.macdSignal;
        if (
          Math.abs(macD - signal) <
          Math.abs(prevIndicators.macd - prevIndicators.macdSignal)
        ) {
          //the distance between the macD and signal is shrinking
          this.convergingMacdSignal = true;
        } else {
          this.convergingMacdSignal = false;
        }
        this.macdCrossoverSignal =
          prevIndicators.macdGTSignal != this.macdGTSignal ? true : false;
      }
    }
  }
}

export class AccountState {
  public totalValue: number;
  public accounts: Array<Account>;

  constructor(value: number, acnts: Array<Account>) {
    this.totalValue = value;
    this.accounts = acnts;
  }
}
