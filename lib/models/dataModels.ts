export class Evaluation {
    public date: Date;
    public macdStatus: MACDStatus;
    public macdCrossoverSignal: boolean;
    constructor(macD:number, signal: number, lastEval?: Evaluation){
        
        this.macdStatus = lastEval ? new MACDStatus(macD,signal,lastEval.macdStatus) : new MACDStatus(macD,signal);
        this.macdCrossoverSignal = lastEval? (lastEval.macdStatus.macdGTSignal != (macD>signal)) : false;

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
            if (lastMACDStatus.lastMacd) {
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
        this.lastMacd = lastMACDStatus.currentMacd;
        this.lastSignal = lastMACDStatus.currentSignal;
        this.macdGTSignal = macD > signal;
    }
}