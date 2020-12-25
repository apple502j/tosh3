@{%
const moo = require("moo");

const normalizeNumber = x => Number(x).toString();

const lexer = moo.compile({
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
    match: /-?[0-9]+(?:\.[0-9]+)?e-?[0-9]+|-?(?:0|[1-9][0-9]*)?\.[0-9]+|-?(?:0|[1-9][0-9]*)\.[0-9]*|0|-?[1-9][0-9]*|0b[01]+|0o[0-7]+|0x[0-9a-fA-F]+/,
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
  op1arg: ['looks_say'],
  rep0arg: ['sensing_mousex', 'sensing_mousey'],
  bool0arg: ['sensing_mousedown'],
  hat0arg: ['event_whenflagclicked', 'event_whenthisspriteclicked', 'control_start_as_clone'],
  hat1arg: ['event_whenkeypressed', 'event_whenbackdropswitchesto', 'event_whenbroadcastreceived']
});

const skip = () => null;

const IGNORE = ["lparen", "rparen", "lbracket", "rbracket", "elsesyntax"]

const genOpcode = opOverwrite => args => {
  let op = args.shift();
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

%}
@lexer lexer

file -> padding {% skip %}
      | padding scripts padding {% ([_, s, _2]) => s %}

padding -> (%WS | %NL):* {% skip %}

scripts -> scripts scriptSep script {% ([scrs, _, scr]) => [...scrs, scr] %}
         | script {% ([scr]) => [scr] %}

scriptSep -> %NL _W %NL {% skip %}
           | scriptSep _W %NL {% skip %}

script -> script %NL line {% ([scrs, _, scr]) => [...scrs, scr] %}
        | line {% ([scr]) => [scr] %}

line -> _W thing _W {% ([_, s, _2]) => s %}
| _W %comment {% skip %}

# thing: line without padding
# callable (=stack block) MAY have semicolon, but it's decorational
# syntax element (hat, C, E) MUST NOT have semicolon
thing -> callable _ semi {% id %}
| syntax {% id %}

callable -> %op1arg _ %lparen _ reportable _ %rparen {% genOpcode() %}

# at-mark syntax (hat block)
# @event_whenflagclicked()
syntax -> %atmark %hat0arg _ %lparen _ %rparen {% genOpcodeForHats() %}
        | %atmark %hat1arg _ %lparen _ menuitem _  %rparen {% genOpcodeForHats() %}
        | %foreversyntax _ %lbracket _ script _ %rbracket {% genOpcode("control_forever") %}
        | %ifsyntax _ %lparen _ boolable _ %rparen _ %lbracket _ script _ %rbracket _ %elsesyntax _ %lbracket _ script _ %rbracket {% genOpcode("control_ifelse") %}
        | %untilsyntax _ %lparen _ boolable _ %rparen _ %lbracket _ script _ %rbracket {% genOpcode("control_repeat_until") %}
        | %repeatsyntax _ %lparen _ numable _ %rparen _ %lbracket _ script _ %rbracket {% genOpcode("control_repeat") %}

reportable -> reporter {% id %}
        | %number {% id %}
        | %string {% id %}
        
numable -> reporter {% id %}
        | %number {% id %}

reporter -> boolreporter {% id %}
        | %rep0arg _ %lparen _ %rparen {% genOpcode() %}
        
menuitem -> %string {% id %}

boolable -> boolreporter {% id %}
        | _ {% skip %}

boolreporter -> %bool0arg _ %lparen _ %rparen {% genOpcode() %}

_ -> _ %WS {% skip %} | _ %NL {% skip %} | null {% skip %}
_W -> %WS {% skip %} | null {% skip %}
__ -> %WS {% skip %}
semi -> %semi {% skip %} | null {% skip %}

