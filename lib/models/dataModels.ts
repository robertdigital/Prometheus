export class Evaluation {
    public date: Date;
    public macdStatus: MACDStatus;
    public macdCrossoverSignal: boolean;
    constructor(macD: Array<number>, signal: Array<number>, lastEval?: Evaluation){
        
        this.macdStatus = lastEval ? new MACDStatus(macD,signal,lastEval.macdStatus) : new MACDStatus(macD,signal);
        this.macdCrossoverSignal = lastEval? (lastEval.macdStatus.macdGTSignal != (macD[0]>signal[0])) : false;

        this.date = new Date();
    }
}

export class MACDStatus {
    public lastMacDs: Array<number>;
    public lastSignals: Array<number>;
    public macdGTSignal: boolean;
    public converging: boolean;
    constructor(macD: Array<number>, signal: Array<number>, lastIndDrirecton?: MACDStatus) {
        if (lastIndDrirecton) {
            if (lastIndDrirecton.lastMacDs) {
                if (Math.abs(macD[0] - signal[0]) < Math.abs(lastIndDrirecton.lastMacDs[0] - lastIndDrirecton.lastSignals[0])) {
                    //the distance between the macD and signal is shrinking
                    this.converging = true;
                } else {
                    this.converging = false;
                }
            }
        }
        this.lastMacDs = macD;
        this.lastSignals = signal;
        this.macdGTSignal = macD[0] > signal[0];
    }
}