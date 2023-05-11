import {DataObjectInstance} from "../executionState/DataObjectInstance";
import * as xml2js from "xml2js";

export class XMLParser {
    xmlFile: XMLDocument;

    public parseToArray(xml: string, referenceObject: string): object {
        let object;

        const parserOptions: xml2js.Options = {
            explicitArray: false,
            ignoreAttrs: false,
        };
        const parser = new xml2js.Parser(parserOptions);
        parser.parseString(xml, (err: any, result: any) => {
             let path;

            if(referenceObject == "od:class") {
                path = ['od:definitions']['od:odBoard']['od:class'];
            }
            if(referenceObject == "odDi:association") {
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