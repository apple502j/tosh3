// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");
const {blocksDefinition, aliases} = require("./blocks.js");

const BOOL_EMPTY = Symbol.for("tosh3.grammar.BOOL_EMPTY");

const normalizeNumber = x => {
  let n = Number(x).toString();
  if (x.includes(".") && !n.includes(".")) n += ".0";
  return n;
};

const lexer = moo.compile(Object.assign({
  NL: {
    match: '\n',
    lineBreaks: true
  },
  WS: /[ \t]+/,
  comment: {
    match: /\/{2}(?:.*)$/,
    value: x => x.slice(2)
  },
  number: {
    match: /-?[0-9]+(?:\.[0-9]+)?e-?[0-9]+|-?(?:0|[1-9][0-9]*)?\.[0-9]+|-?(?:0|[1-9][0-9]*)\.[0-9]*|0b[01]+|0o[0-7]+|0x[0-9a-fA-F]+|0|-?[1-9][0-9]*/,
    value: normalizeNumber
  },
  string: {
    match: [/"(?:(?:\\["\\]|[^\n"\\])*)"/, /'(?:(?:\\['\\]|[^\n'\\])*)'/],
    value: x => x.slice(1, -1)
  },
  atmark: '@',
  semi: ';',
  comma: ',',
  lparen: '(',
  rparen: ')',
  lsquare: '[',
  rsquare: ']',
  lbracket: '{',
  rbracket: '}',
  ifsyntax: 'if',
  elsesyntax: 'else',
  untilsyntax: 'until',
  repeatsyntax: 'repeat',
  foreversyntax: 'forever',
  procedurecallsyntax: 'procedure_call',
  proceduredefinesyntax: 'define',
  procedurewarpsyntax: 'warp',
  booltype: 'boolean',
  reportertype: 'reporter'
}, blocksDefinition));

const skip = () => null;

const IGNORE = ["lparen", "rparen", "lbracket", "rbracket", "elsesyntax", "comma"]

const genOpcode = opOverwrite => args => {
  let op = args.shift();
  if (aliases[op]) op = aliases[op];
  if (opOverwrite) op = opOverwrite;
  const actualArgs = args.filter(arg => arg && !IGNORE.includes(arg.type));
  return ({op, args: actualArgs});
};

const genOpcodeForHats = opOverwrite => args => {
  args.shift();
  let op = args.shift();
  if (opOverwrite) op = opOverwrite;
  const actualArgs = args.filter(arg => arg && !IGNORE.includes(arg.type));
  return ({op, args: actualArgs});
};

// %procedurecallsyntax _ %lparen _ %string _ %comma _ procargs _ %rparen
const procedureCall = (args, hasArgs) => {
  const op = args.shift();
  args.shift();
  args.shift();
  args.shift();
  const procname = args.shift();
  let actualArgs = [];
  if (hasArgs) {
    actualArgs = args.filter(arg => arg && !IGNORE.includes(arg.type));
  }
  return ({op, procname, args: actualArgs});
}

// %atmark _ %proceduredefinesyntax _ %procedurewarpsyntax _ %lparen _ %string _ %comma _ proctypedargs _ %rparen
const procedureDefine = (args, {hasArgs, warp}) => {
  args.shift();
  args.shift();
  const op = args.shift();
  args.shift();
  if (warp) {
    args.shift();
    args.shift();
  }
  args.shift();
  args.shift();
  const name = args.shift();
  let actualArgs = [];
  if (hasArgs) {
    actualArgs = args.filter(arg => arg && !IGNORE.includes(arg.type));
  }
  return ({op, warp, name, args: actualArgs});
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "file", "symbols": ["padding"], "postprocess": skip},
    {"name": "file", "symbols": ["padding", "scripts", "padding"], "postprocess": ([_, s, _2]) => s},
    {"name": "padding$ebnf$1", "symbols": []},
    {"name": "padding$ebnf$1$subexpression$1", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)]},
    {"name": "padding$ebnf$1$subexpression$1", "symbols": [(lexer.has("NL") ? {type: "NL"} : NL)]},
    {"name": "padding$ebnf$1", "symbols": ["padding$ebnf$1", "padding$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "padding", "symbols": ["padding$ebnf$1"], "postprocess": skip},
    {"name": "scripts", "symbols": ["scripts", "scriptSep", "script"], "postprocess": ([scrs, _, scr]) => [...scrs, scr]},
    {"name": "scripts", "symbols": ["script"], "postprocess": ([scr]) => [scr]},
    {"name": "scriptSep", "symbols": [(lexer.has("NL") ? {type: "NL"} : NL), "_W", (lexer.has("NL") ? {type: "NL"} : NL)], "postprocess": skip},
    {"name": "scriptSep", "symbols": ["scriptSep", "_W", (lexer.has("NL") ? {type: "NL"} : NL)], "postprocess": skip},
    {"name": "scriptSep", "symbols": ["scriptSep", (lexer.has("comment") ? {type: "comment"} : comment), (lexer.has("NL") ? {type: "NL"} : NL)], "postprocess": skip},
    {"name": "script", "symbols": ["script", (lexer.has("NL") ? {type: "NL"} : NL), "line"], "postprocess": ([scrs, _, scr]) => [...scrs, scr]},
    {"name": "script", "symbols": ["hatline"], "postprocess": ([scr]) => [scr]},
    {"name": "hatline", "symbols": ["_W", "hats", "_W"], "postprocess": ([_, s, _2]) => s},
    {"name": "line", "symbols": ["_W", "thing", "_W"], "postprocess": ([_, s, _2]) => s},
    {"name": "line", "symbols": ["_W", (lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": skip},
    {"name": "stacks", "symbols": ["stacks", (lexer.has("NL") ? {type: "NL"} : NL), "line"], "postprocess": ([scrs, _, scr]) => [...scrs, scr]},
    {"name": "stacks", "symbols": ["line"], "postprocess": ([scr]) => [scr]},
    {"name": "thing", "symbols": ["callable", "_", "semi"], "postprocess": id},
    {"name": "thing", "symbols": ["syntax"], "postprocess": id},
    {"name": "callable", "symbols": [(lexer.has("op0arg") ? {type: "op0arg"} : op0arg), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opS") ? {type: "opS"} : opS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opN") ? {type: "opN"} : opN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opM") ? {type: "opM"} : opM), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opB") ? {type: "opB"} : opB), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "boolable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opNN") ? {type: "opNN"} : opNN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opSN") ? {type: "opSN"} : opSN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opMN") ? {type: "opMN"} : opMN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opMS") ? {type: "opMS"} : opMS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opSM") ? {type: "opSM"} : opSM), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "menuitem", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opNNN") ? {type: "opNNN"} : opNNN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opSNM") ? {type: "opSNM"} : opSNM), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "menuitem", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": [(lexer.has("opNMS") ? {type: "opNMS"} : opNMS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "menuitem", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "callable", "symbols": ["procedure"], "postprocess": id},
    {"name": "hats", "symbols": [(lexer.has("atmark") ? {type: "atmark"} : atmark), (lexer.has("hat0arg") ? {type: "hat0arg"} : hat0arg), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcodeForHats()},
    {"name": "hats", "symbols": [(lexer.has("atmark") ? {type: "atmark"} : atmark), (lexer.has("hatM") ? {type: "hatM"} : hatM), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcodeForHats()},
    {"name": "hats", "symbols": [(lexer.has("atmark") ? {type: "atmark"} : atmark), (lexer.has("hatMN") ? {type: "hatMN"} : hatMN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcodeForHats()},
    {"name": "hats", "symbols": ["define"], "postprocess": id},
    {"name": "syntax", "symbols": [(lexer.has("foreversyntax") ? {type: "foreversyntax"} : foreversyntax), "_", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "stacks", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": genOpcode("control_forever")},
    {"name": "syntax", "symbols": [(lexer.has("ifsyntax") ? {type: "ifsyntax"} : ifsyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "boolable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "stacks", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), "_", (lexer.has("elsesyntax") ? {type: "elsesyntax"} : elsesyntax), "_", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "stacks", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": genOpcode("control_ifelse")},
    {"name": "syntax", "symbols": [(lexer.has("ifsyntax") ? {type: "ifsyntax"} : ifsyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "boolable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "stacks", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket), "_"], "postprocess": genOpcode("control_if")},
    {"name": "syntax", "symbols": [(lexer.has("untilsyntax") ? {type: "untilsyntax"} : untilsyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "boolable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "stacks", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": genOpcode("control_repeat_until")},
    {"name": "syntax", "symbols": [(lexer.has("repeatsyntax") ? {type: "repeatsyntax"} : repeatsyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "stacks", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": genOpcode("control_repeat")},
    {"name": "reportable", "symbols": ["reporter"], "postprocess": id},
    {"name": "reportable", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": id},
    {"name": "reportable", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": id},
    {"name": "numable", "symbols": ["reporter"], "postprocess": id},
    {"name": "numable", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": id},
    {"name": "reporter", "symbols": ["boolreporter"], "postprocess": id},
    {"name": "reporter", "symbols": [(lexer.has("rep0arg") ? {type: "rep0arg"} : rep0arg), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repM") ? {type: "repM"} : repM), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repS") ? {type: "repS"} : repS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repN") ? {type: "repN"} : repN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repMN") ? {type: "repMN"} : repMN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repMS") ? {type: "repMS"} : repMS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repNM") ? {type: "repNM"} : repNM), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "menuitem", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repNS") ? {type: "repNS"} : repNS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repNN") ? {type: "repNN"} : repNN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repSS") ? {type: "repSS"} : repSS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "reporter", "symbols": [(lexer.has("repSM") ? {type: "repSM"} : repSM), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "menuitem", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "menuitem", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": id},
    {"name": "boolable", "symbols": ["boolreporter"], "postprocess": id},
    {"name": "boolable", "symbols": ["_"], "postprocess": () => BOOL_EMPTY},
    {"name": "boolreporter", "symbols": [(lexer.has("bool0arg") ? {type: "bool0arg"} : bool0arg), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "boolreporter", "symbols": [(lexer.has("boolS") ? {type: "boolS"} : boolS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "boolreporter", "symbols": [(lexer.has("boolN") ? {type: "boolN"} : boolN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "boolreporter", "symbols": [(lexer.has("boolB") ? {type: "boolB"} : boolB), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "boolable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "boolreporter", "symbols": [(lexer.has("boolM") ? {type: "boolM"} : boolM), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "boolreporter", "symbols": [(lexer.has("boolMS") ? {type: "boolMS"} : boolMS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "menuitem", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "boolreporter", "symbols": [(lexer.has("boolNN") ? {type: "boolNN"} : boolNN), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "numable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "numable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "boolreporter", "symbols": [(lexer.has("boolSS") ? {type: "boolSS"} : boolSS), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "reportable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "reportable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "boolreporter", "symbols": [(lexer.has("boolBB") ? {type: "boolBB"} : boolBB), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "boolable", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "boolable", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": genOpcode()},
    {"name": "procedure", "symbols": [(lexer.has("procedurecallsyntax") ? {type: "procedurecallsyntax"} : procedurecallsyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "procargs", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => procedureCall(d, true)},
    {"name": "procedure", "symbols": [(lexer.has("procedurecallsyntax") ? {type: "procedurecallsyntax"} : procedurecallsyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => procedureCall(d, false)},
    {"name": "procargs", "symbols": ["procargs", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "procarg"], "postprocess": ([arr, _, _1, _2, arg]) => [...arr, arg]},
    {"name": "procargs", "symbols": ["procarg"], "postprocess": d => d},
    {"name": "procarg", "symbols": ["reportable"], "postprocess": id},
    {"name": "procarg", "symbols": ["_"], "postprocess": () => BOOL_EMPTY},
    {"name": "define", "symbols": [(lexer.has("atmark") ? {type: "atmark"} : atmark), "_", (lexer.has("proceduredefinesyntax") ? {type: "proceduredefinesyntax"} : proceduredefinesyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "proctypedargs", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => procedureDefine(d, {hasArgs: true})},
    {"name": "define", "symbols": [(lexer.has("atmark") ? {type: "atmark"} : atmark), "_", (lexer.has("proceduredefinesyntax") ? {type: "proceduredefinesyntax"} : proceduredefinesyntax), "_", (lexer.has("procedurewarpsyntax") ? {type: "procedurewarpsyntax"} : procedurewarpsyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "proctypedargs", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => procedureDefine(d, {hasArgs: true, warp: true})},
    {"name": "define", "symbols": [(lexer.has("atmark") ? {type: "atmark"} : atmark), "_", (lexer.has("proceduredefinesyntax") ? {type: "proceduredefinesyntax"} : proceduredefinesyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => procedureDefine(d, {hasArgs: false})},
    {"name": "define", "symbols": [(lexer.has("atmark") ? {type: "atmark"} : atmark), "_", (lexer.has("proceduredefinesyntax") ? {type: "proceduredefinesyntax"} : proceduredefinesyntax), "_", (lexer.has("procedurewarpsyntax") ? {type: "procedurewarpsyntax"} : procedurewarpsyntax), "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": d => procedureDefine(d, {hasArgs: false, warp: true})},
    {"name": "proctypedargs", "symbols": ["proctypedargs", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "proctypedarg"], "postprocess": ([arr, _, _2, _3, arg]) => [...arr, arg]},
    {"name": "proctypedargs", "symbols": ["proctypedarg"], "postprocess": id},
    {"name": "proctypedarg", "symbols": [(lexer.has("booltype") ? {type: "booltype"} : booltype), "_", (lexer.has("string") ? {type: "string"} : string)], "postprocess": ([type, _, name]) => ({type, name})},
    {"name": "proctypedarg", "symbols": [(lexer.has("reportertype") ? {type: "reportertype"} : reportertype), "_", (lexer.has("string") ? {type: "string"} : string)], "postprocess": ([type, _, name]) => ({type, name})},
    {"name": "_", "symbols": ["_", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": skip},
    {"name": "_", "symbols": ["_", (lexer.has("NL") ? {type: "NL"} : NL)], "postprocess": skip},
    {"name": "_", "symbols": [], "postprocess": skip},
    {"name": "_W", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": skip},
    {"name": "_W", "symbols": [], "postprocess": skip},
    {"name": "__", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": skip},
    {"name": "semi", "symbols": [(lexer.has("semi") ? {type: "semi"} : semi)], "postprocess": skip},
    {"name": "semi", "symbols": [], "postprocess": skip}
]
  , ParserStart: "file"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
