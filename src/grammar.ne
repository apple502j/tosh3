@{%
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

%}
@lexer lexer

file -> padding {% skip %}
      | padding scripts padding {% ([_, s, _2]) => s %}

padding -> (%WS | %NL):* {% skip %}

scripts -> scripts scriptSep script {% ([scrs, _, scr]) => [...scrs, scr] %}
         | script {% ([scr]) => [scr] %}

scriptSep -> %NL _W %NL {% skip %}
           | scriptSep _W %NL {% skip %}
           | scriptSep %comment %NL {% skip %}

script -> script %NL line {% ([scrs, _, scr]) => [...scrs, scr] %}
        | hatline {% ([scr]) => [scr] %}

hatline -> _W hats _W {% ([_, s, _2]) => s %}

line -> _W thing _W {% ([_, s, _2]) => s %}
| _W %comment {% skip %}

stacks -> stacks %NL line {% ([scrs, _, scr]) => [...scrs, scr] %}
        | line {% ([scr]) => [scr] %}

# thing: line without padding
# callable (=stack block) MAY have semicolon, but it's decorational
# syntax element (hat, C, E) MUST NOT have semicolon
thing -> callable _ semi {% id %}
| syntax {% id %}

callable -> %op0arg _ %lparen _ %rparen {% genOpcode() %}
| %opS _ %lparen _ reportable _ %rparen {% genOpcode() %}
| %opN _ %lparen _ numable _ %rparen {% genOpcode() %}
| %opM _ %lparen _ menuitem _ %rparen {% genOpcode() %}
| %opB _ %lparen _ boolable _ %rparen {% genOpcode() %}
| %opNN _ %lparen _ numable _ %comma _ numable _ %rparen {% genOpcode() %}
| %opSN _ %lparen _ reportable _ %comma _ numable _ %rparen {% genOpcode() %}
| %opMN _ %lparen _ menuitem _ %comma _ numable _ %rparen {% genOpcode() %}
| %opMS _ %lparen _ menuitem _ %comma _ reportable _ %rparen {% genOpcode() %}
| %opSM _ %lparen _ reportable _ %comma _ menuitem _ %rparen {% genOpcode() %}
| %opNNN _ %lparen _ numable _ %comma _ numable _ %comma _ numable _ %rparen {% genOpcode() %}
| %opSNM _ %lparen _ reportable _ %comma _ numable _ %comma _ menuitem _ %rparen {% genOpcode() %}
| %opNMS _ %lparen _ numable _ %comma _ menuitem _ %comma _ reportable _ %rparen {% genOpcode() %}
| procedure {% id %}

hats -> %atmark %hat0arg _ %lparen _ %rparen {% genOpcodeForHats() %}
        | %atmark %hatM _ %lparen _ menuitem _  %rparen {% genOpcodeForHats() %}
        | %atmark %hatMN _ %lparen _ menuitem _ %comma _ numable  _  %rparen {% genOpcodeForHats() %}
        | define {% id %}

syntax -> %foreversyntax _ %lbracket _ stacks _ %rbracket {% genOpcode("control_forever") %}
        | %ifsyntax _ %lparen _ boolable _ %rparen _ %lbracket _ stacks _ %rbracket _ %elsesyntax _ %lbracket _ stacks _ %rbracket {% genOpcode("control_ifelse") %}
        | %untilsyntax _ %lparen _ boolable _ %rparen _ %lbracket _ stacks _ %rbracket {% genOpcode("control_repeat_until") %}
        | %repeatsyntax _ %lparen _ numable _ %rparen _ %lbracket _ stacks _ %rbracket {% genOpcode("control_repeat") %}

reportable -> reporter {% id %}
        | %number {% id %}
        | %string {% id %}
        
numable -> reporter {% id %}
        | %number {% id %}

reporter -> boolreporter {% id %}
| %rep0arg _ %lparen _ %rparen {% genOpcode() %}
| %repM _ %lparen _ menuitem _ %rparen {% genOpcode() %}
| %repS _ %lparen _ reportable _ %rparen {% genOpcode() %}
| %repN _ %lparen _ numable _ %rparen {% genOpcode() %}
| %repMN _ %lparen _ menuitem _ %comma _ numable _ %rparen {% genOpcode() %}
| %repMS _ %lparen _ menuitem _ %comma _ reportable _ %rparen {% genOpcode() %}
| %repNM _ %lparen _ numable _ %comma _ menuitem _ %rparen {% genOpcode() %}
| %repNS _ %lparen _ numable _ %comma _ reportable _ %rparen {% genOpcode() %}
| %repNN _ %lparen _ numable _ %comma _ numable _ %rparen {% genOpcode() %}
| %repSS _ %lparen _ reportable _ %comma _ reportable _ %rparen {% genOpcode() %}
| %repSM _ %lparen _ reportable _ %comma _ menuitem _ %rparen {% genOpcode() %}
        
menuitem -> %string {% id %}

boolable -> boolreporter {% id %}
        | _ {% () => BOOL_EMPTY %}

boolreporter -> %bool0arg _ %lparen _ %rparen {% genOpcode() %}
| %boolS _ %lparen _ reportable _ %rparen {% genOpcode() %}
| %boolN _ %lparen _ numable _ %rparen {% genOpcode() %}
| %boolB _ %lparen _ boolable _ %rparen {% genOpcode() %}
| %boolM _ %lparen _ menuitem _ %rparen {% genOpcode() %}
| %boolMS _ %lparen _ menuitem _ %comma _ reportable _ %rparen {% genOpcode() %}
| %boolNN _ %lparen _ numable _ %comma _ numable _ %rparen {% genOpcode() %}
| %boolSS _ %lparen _ reportable _ %comma _ reportable _ %rparen {% genOpcode() %}
| %boolBB _ %lparen _ boolable _ %comma _ boolable _ %rparen {% genOpcode() %}

procedure -> %procedurecallsyntax _ %lparen _ %string _ %comma _ procargs _ %rparen {% d => procedureCall(d, true) %}
| %procedurecallsyntax _ %lparen _ %string _  %rparen {% d => procedureCall(d, false) %}
procargs -> procargs _ %comma _ procarg {% ([arr, _, _1, _2, arg]) => [...arr, arg] %}
| procarg {% d => d %}
procarg -> reportable {% id %}
| _ {% () => BOOL_EMPTY %}

define -> %atmark _ %proceduredefinesyntax _ %lparen _ %string _ %comma _ proctypedargs _ %rparen {% d => procedureDefine(d, {hasArgs: true}) %}
| %atmark _ %proceduredefinesyntax _ %procedurewarpsyntax _ %lparen _ %string _ %comma _ proctypedargs _ %rparen {% d => procedureDefine(d, {hasArgs: true, warp: true}) %}
| %atmark _ %proceduredefinesyntax _ %lparen _ %string _ %rparen {% d => procedureDefine(d, {hasArgs: false}) %}
| %atmark _ %proceduredefinesyntax _ %procedurewarpsyntax _ %lparen _ %string _  %rparen {% d => procedureDefine(d, {hasArgs: false, warp: true}) %}
proctypedargs -> proctypedargs _ %comma _ proctypedarg {% ([arr, _, _2, _3, arg]) => [...arr, arg] %}
| proctypedarg {% id %}
proctypedarg -> %booltype _ %string {% ([type, _, name]) => ({type, name}) %}
| %reportertype _ %string {% ([type, _, name]) => ({type, name}) %}

_ -> _ %WS {% skip %} | _ %NL {% skip %} | null {% skip %}
_W -> %WS {% skip %} | null {% skip %}
__ -> %WS {% skip %}
semi -> %semi {% skip %} | null {% skip %}

