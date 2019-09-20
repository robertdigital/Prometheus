"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
class DataService {
    constructor() {
        this.url = "https://api.coinbase.com/v2/prices/BTC-USD/buy";
        this.options = {
            uri: this.url
        };
    }
    getCurrentPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            return request.get(this.options);
        });
    }
}
exports.DataService = DataService;
//# sourceMappingURL=DataService.js.map