"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLParser = void 0;
const xml2js = __importStar(require("xml2js"));
class XMLParser {
    parseToArray(xml, referenceObject) {
        let object;
        const parserOptions = {
            explicitArray: false,
            ignoreAttrs: false,
        };
        const parser = new xml2js.Parser(parserOptions);
        parser.parseString(xml, (err, result) => {
            let path;
            if (referenceObject == "od:class") {
                path = ['od:definitions']['od:odBoard']['od:class'];
            }
            if (referenceObject == "odDi:association") {
                path = ['od:definitions']['odDi:odRootBoard']['odDi:odPlane']['odDi:association'];
            }
            object = result[path];
            // Hier hast du Zugriff auf das Ziel und die Ziele
            console.log('Class:', class1);
            console.log('Association:', association);
        });
        return object;
    }
}
exports.XMLParser = XMLParser;
