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
const xml2js = __importStar(require("xml2js"));
//import type * as index from "../../app/index.js";
let parseString = require('xml2js').parseString;
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<od:definitions xmlns:od="http://tk/schema/od" xmlns:odDi="http://tk/schema/odDi" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC">\n' +
    '  <od:odBoard id="Board">\n' +
    '    <od:class name="House" id="Object_151nt7j" attributeValues="" type="od:Class">\n' +
    '      <od:associations>Association_1bgrmyn</od:associations>\n' +
    '    </od:class>\n' +
    '    <od:class name="Story" id="Object_1hxfvld" attributeValues="" type="od:Class" />\n' +
    '    <od:association id="Association_1bgrmyn" type="od:Association" sourceCardinality="0..*" targetCardinality="0..*" sourceRef="Object_151nt7j" targetRef="Object_1hxfvld" />\n' +
    '  </od:odBoard>\n' +
    '  <odDi:odRootBoard id="RootBoard">\n' +
    '    <odDi:odPlane id="Plane" boardElement="Board">\n' +
    '      <odDi:association id="Association_1bgrmyn_di" boardElement="Association_1bgrmyn">\n' +
    '        <odDi:waypoint x="460" y="235" />\n' +
    '        <odDi:waypoint x="515" y="235" />\n' +
    '        <odDi:odSourceLabel>\n' +
    '          <dc:Bounds x="448" y="236" width="23" height="18" />\n' +
    '        </odDi:odSourceLabel>\n' +
    '        <odDi:odTargetLabel>\n' +
    '          <dc:Bounds x="503" y="236" width="23" height="18" />\n' +
    '        </odDi:odTargetLabel>\n' +
    '      </odDi:association>\n' +
    '      <odDi:odShape id="Object_151nt7j_di" boardElement="Object_151nt7j">\n' +
    '        <dc:Bounds x="310" y="190" width="150" height="90" />\n' +
    '      </odDi:odShape>\n' +
    '      <odDi:odShape id="Object_1hxfvld_di" boardElement="Object_1hxfvld">\n' +
    '        <dc:Bounds x="515" y="190" width="150" height="90" />\n' +
    '      </odDi:odShape>\n' +
    '    </odDi:odPlane>\n' +
    '  </odDi:odRootBoard>\n' +
    '</od:definitions>\n';
describe('first test', () => {
    test('2', () => {
        const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            ignorePiTags: true
        };
        const parser = new XMLParser(options);
        let jObj = parser.parse(xml);
        const builder = new XMLBuilder();
        const xmlContent = builder.build(jObj);
        console.dir(jObj);
    });
    test('3', () => {
        const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            ignorePiTags: true
        };
        const parser = new XMLParser(options);
        let jObj = parser.parse(xml);
        const builder = new XMLBuilder();
        const xmlContent = builder.build(jObj);
        console.dir(jObj);
    });
    test('i dunno', () => {
        let output;
        const parserOptions = {
            explicitArray: false,
            ignoreAttrs: false, // Ignoriert Attribute und konzentriert sich nur auf den Textinhalt
        };
        const parser = new xml2js.Parser(parserOptions);
        parser.parseString(xml, (err, result) => {
            if (err) {
                console.error('Fehler beim Parsen der XML-Datei:', err);
                return;
            }
            let class1 = result['od:definitions']['od:odBoard']['od:class'];
            // Extrahiere die Ziele (objectives) aus dem Ziel
            let association = result['od:definitions']['odDi:odRootBoard']['odDi:odPlane']['odDi:association'];
            // Hier hast du Zugriff auf das Ziel und die Ziele
            console.log('Class:', class1);
            console.log('Association:', association);
        });
        /*
        let extractedData = result;
        //extractedData.filter((element) => element == '[Object: null prototype]')
        console.log(result);
        console.log(util.inspect(result, false, null));
        console.dir(JSON.stringify(result));

        output = result;
        console.log(util.inspect(result, false, null));

        console.dir(JSON.stringify(result));

         */
    });
    /*
    var xml = "<config><test>Hello</test><data>SomeData</data></config>";

    var extractedData = "";
    var parser = new xml2js.Parser();
    parser.parseString(xml, function(err,result){
        //Extract the value from the data element
        extractedData = result['config']['data'];
        console.log(extractedData);
    });
    console.log("Note that you can't use value here if parseString is async; extractedData=", extractedData);

     */
});
