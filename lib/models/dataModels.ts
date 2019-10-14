export class Evaluation {
    public date: Date;
    public price: number;
    public macdStatus: MACDStatus;
    public macdCrossoverSignal: boolean;
    constructor(currentPrice: number, macD: number, signal: number, lastEval?: Evaluation) {

        this.price = currentPrice;

        this.macdStatus = lastEval ? new MACDStatus(macD, signal, lastEval.macdStatus) : new MACDStatus(macD, signal);
        this.macdCrossoverSignal = lastEval ? (lastEval.macdStatus.macdGTSignal != (macD > signal)) : false;

        this.date = new Date();
    }
}

export class MACDStatus {
    public currentMacd: number;
    public currentSignal: number;
    public lastMacd: number;
    public lastSignal: number;
    public macdGTSignal: boolean;
    public converging: boolean;
    constructor(macD: number, signal: number, lastMACDStatus?: MACDStatus) {

        if (lastMACDStatus) {
            if (lastMACDStatus.currentMacd && lastMACDStatus.currentSignal) {
                this.lastMacd = lastMACDStatus.currentMacd;
                this.lastSignal = lastMACDStatus.currentSignal;
                if (Math.abs(macD - signal) < Math.abs(lastMACDStatus.currentMacd - lastMACDStatus.currentSignal)) {
                    //the distance between the macD and signal is shrinking
                    this.converging = true;
                } else {
                    this.converging = false;
                }
            }
        }
        this.currentMacd = macD;
        this.currentSignal = signal;
        this.macdGTSignal = macD > signal;
    }
}