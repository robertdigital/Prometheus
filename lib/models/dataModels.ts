export class Evaluation {
    public date: Date;
    public price: number;
    public macdStatus: MACDStatus;
    public macdCrossoverSignal: boolean;
    public rsiStatus: RSIStatus;
    constructor(currentPrice: number, macD: number, signal: number,  rsi: number, lastEval?: Evaluation) {

        this.price = currentPrice;

        this.macdStatus = lastEval && lastEval.macdStatus ? new MACDStatus(macD, signal, lastEval.macdStatus) : new MACDStatus(macD, signal);
        this.macdCrossoverSignal = lastEval && lastEval.macdStatus.macdGTSignal ? (lastEval.macdStatus.macdGTSignal != (macD > signal)) : false;
        this.rsiStatus = lastEval && lastEval.rsiStatus ? new RSIStatus(rsi,lastEval.rsiStatus) : new RSIStatus(rsi);

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

export class RSIStatus {
    public currentRSI: number;
    public currentActionSignal: string;
    public lastRSI : number;
    public lastActionSignal : string;
    constructor(rsi:number,LastRSIStatus?:RSIStatus){
        if(LastRSIStatus){
            if(LastRSIStatus.currentRSI && LastRSIStatus.currentActionSignal){
                this.lastRSI = LastRSIStatus.currentRSI;
            }
        }
        this.currentRSI = rsi;
    }
}