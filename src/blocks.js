const OP = "op";
const REPORTER = "rep";
const BOOLEAN = "bool";
const HAT = "hat";

const NOARG = {code: "0arg"};

class ArgType {
  constructor (inputName) {
    this.inputName = inputName;
  }  
}

class StringType extends ArgType {
  get code () {
    return "S";
  }
}
const S = (...args) => new StringType(...args);

class NumberType extends ArgType {
  get code () {
    return "N";
  }
}
const N = (...args) => new NumberType(...args);

class BooleanType extends ArgType {
  get code () {
    return "B";
  }
}
const B = (...args) => new BooleanType(...args);

class MenuType extends ArgType {
  get code () {
    return "M";
  }
}
const M = (...args) => new MenuType(...args);

const blocks = {
  motion_movesteps: [OP, N("STEPS")],
  motion_gotoxy: [OP, N("X"), N("Y")],
  motion_goto: [[OP, "xy"], S("TO")],
  motion_turnright: [OP, N("DEGREES")],
  motion_turnleft: [OP, N("DEGREES")],
  motion_pointindirection: [OP, N("DIRECTION")],
  motion_pointtowards: [OP, S("TOWARDS")],
  motion_glidesecstoxy: [OP, N("SECS"), N("X"), N("Y")],
  motion_glideto: [OP, N("SECS"), S("TO")],
  motion_ifonedgebounce: [OP],
  motion_setrotationstyle: [OP, M("STYLE")],
  motion_changexby: [OP, N("DX")],
  motion_setx: [OP, N("X")],
  motion_changeyby: [OP, N("DY")],
  motion_sety: [OP, N("Y")],
  motion_xposition: [REPORTER],
  motion_yposition: [REPORTER],
  motion_direction: [REPORTER],
  
  looks_say: [[OP, "forsecs"], S("MESSAGE")],
  looks_sayforsecs: [OP, S("MESSAGE"), N("SECS")],
  looks_think: [[OP, "forsecs"], S("MESSAGE")],
  looks_thinkforsecs: [OP, S("MESSAGE"), N("SECS")],
  looks_show: [OP],
  looks_hide: [OP],
  looks_switchcostumeto: [OP, S("COSTUME")],
  looks_switchbackdropto: [[OP, "andwait"], S("BACKDROP")],
  looks_switchbackdroptoandwait: [OP, S("BACKDROP")],
  looks_nextcostume: [OP],
  looks_nextbackdrop: [OP],
  looks_changeeffectby: [OP, M("EFFECT"), N("CHANGE")],
  looks_seteffectto: [OP, M("EFFECT"), N("VALUE")],
  looks_cleargraphiceffects: [OP],
  looks_changesizeby: [OP, N("CHANGE")],
  looks_setsizeto: [OP, N("SIZE")],
  looks_gotofrontback: [OP, M("FRONT_BACK")],
  looks_goforwardbackwardlayers: [OP, M("FORWARD_BACKWARD"), N("NUM")],
  looks_size: [REPORTER],
  looks_costumenumbername: [REPORTER, M("NUMBER_NAME")],
  looks_backdropnumbername: [REPORTER, M("NUMBER_NAME")],
  
  sound_play: [[OP, "untildone"], S("SOUND_MENU")],
  sound_playuntildone: [OP, S("SOUND_MENU")],
  sound_stopallsounds: [OP],
  sound_seteffectto: [OP, M("EFFECT"), N("VALUE")],
  sound_changeeffectby: [OP, M("EFFECT"), N("VALUE")],
  sound_cleareffects: [OP],
  sound_setvolumeto: [OP, N("VOLUME")],
  sound_changevolumeby: [OP, N("VOLUME")],
  sound_volume: [REPORTER],
  
  event_whenflagclicked: [HAT],
  event_whenkeypressed: [HAT, M("KEY_OPTION")],
  event_whenthisspriteclicked: [HAT],
  event_whenbackdropswitchesto: [HAT, M("BACKDROP")],
  event_whengreaterthan: [HAT, M("WHENGREATERTHANMENU"), N("VALUE")],
  event_whenbroadcastreceived: [HAT, M("BROADCAST_OPTION")],
  event_broadcast: [[OP, "andwait"], S("BROADCAST_INPUT")],
  event_broadcastandwait: [OP, S("BROADCAST_INPUT")],
  
  control_wait: [[OP, "_until"], N("DURATION")],
  control_wait_until: [OP, B("CONDITION")],
  control_stop: [OP, M("STOP_OPTION")],
  control_create_clone_of: [OP, S("CLONE_OPTION")],
  control_delete_this_clone: [OP],
  
  sensing_touchingobject: [BOOLEAN, S("TOUCHINGOBJECTMENU")],
  sensing_touchingcolor: [BOOLEAN, N("COLOR")],
  sensing_coloristouchingcolor: [BOOLEAN, N("COLOR"), N("COLOR2")],
  sensing_distanceto: [REPORTER, S("DISTANCETOMENU")],
  sensing_timer: [REPORTER],
  sensing_resettimer: [OP],
  sensing_of: [REPORTER, M("PROPERTY"), S("OBJECT")],
  sensing_mousex: [REPORTER],
  sensing_mousey: [REPORTER],
  sensing_setdragmode: [OP, M("DRAG_MODE")],
  sensing_mousedown: [BOOLEAN],
  sensing_keypressed: [BOOLEAN, S("KEY_OPTION")],
  sensing_current: [REPORTER, M("CURRENTMENU")],
  sensing_dayssince2000: [REPORTER],
  sensing_loudness: [REPORTER],
  sensing_askandwait: [OP, S("QUESTION")],
  sensing_answer: [REPORTER],
  sensing_username: [REPORTER],
  
  // Operators (PHP-like)
  add: [REPORTER, N("NUM1"), N("NUM2")],
  sub: [REPORTER, N("NUM1"), N("NUM2")],
  mul: [REPORTER, N("NUM1"), N("NUM2")],
  div: [REPORTER, N("NUM1"), N("NUM2")],
  mod: [REPORTER, N("NUM1"), N("NUM2")],
  mt_rand: [REPORTER, N("FROM"), N("TO")],
  lt: [BOOLEAN, S("OPERAND1"), S("OPERAND2")],
  eq: [BOOLEAN, S("OPERAND1"), S("OPERAND2")],
  strcasecmp: [BOOLEAN, S("OPERAND1"), S("OPERAND2")],
  gt: [BOOLEAN, S("OPERAND1"), S("OPERAND2")],
  and: [BOOLEAN, B("OPERAND1"), B("OPERAND2")],
  or: [BOOLEAN, B("OPERAND1"), B("OPERAND2")],
  not: [BOOLEAN, B("OPERAND")],
  join: [REPORTER, S("STRING1"), S("STRING2")],
  strlen: [REPORTER, S("STRING")],
  stristr: [BOOLEAN, S("STRING1"), S("STRING2")],
  round: [REPORTER, N("NUM")],
  
  // Operators (Scratch-like)
  operator_add: [REPORTER, N("NUM1"), N("NUM2")],
  operator_subtract: [REPORTER, N("NUM1"), N("NUM2")],
  operator_multiply: [REPORTER, N("NUM1"), N("NUM2")],
  operator_divide: [REPORTER, N("NUM1"), N("NUM2")],
  operator_mod: [REPORTER, N("NUM1"), N("NUM2")],
  operator_random: [REPORTER, N("FROM"), N("TO")],
  operator_lt: [BOOLEAN, S("OPERAND1"), S("OPERAND2")],
  operator_equals: [BOOLEAN, S("OPERAND1"), S("OPERAND2")],
  operator_gt: [BOOLEAN, S("OPERAND1"), S("OPERAND2")],
  operator_and: [BOOLEAN, B("OPERAND1"), B("OPERAND2")],
  operator_or: [BOOLEAN, B("OPERAND1"), B("OPERAND2")],
  operator_not: [BOOLEAN, B("OPERAND")],
  operator_join: [REPORTER, S("STRING1"), S("STRING2")],
  operator_letter_of: [REPORTER, N("LETTER"), S("STRING")],
  operator_length: [REPORTER, S("STRING")],
  operator_contains: [BOOLEAN, S("STRING1"), S("STRING2")],
  operator_round: [REPORTER, N("NUM")],
  operator_mathop: [REPORTER, M("OPERATOR"), N("NUM")],
  
  var: [REPORTER, M("VARIABLE")],
  assign: [OP, M("VARIABLE"), S("VALUE")],
  list: [REPORTER, M("LIST")],
  
  data_variable: [REPORTER, M("VARIABLE")],
  data_setvariableto: [OP, M("VARIABLE"), S("VALUE")],
  data_changevariableby: [OP, M("VARIABLE"), N("VALUE")],
  data_hidevariable: [OP, M("VARIABLE")],
  data_showvariable: [OP, M("VARIABLE")],
  data_listcontents: [REPORTER, M("LIST")],
  data_addtolist: [OP, S("ITEM"), M("LIST")],
  data_deleteoflist: [OP, N("INDEX"), M("LIST")],
  data_deletealloflist: [OP, M("LIST")],
  data_insertatlist: [OP, S("ITEM"), N("INDEX"), M("LIST")],
  data_replaceitemoflist: [OP, N("INDEX"), M("LIST"), S("ITEM")],
  data_itemoflist: [REPORTER, N("INDEX"), M("LIST")],
  data_itemnumoflist: [REPORTER, S("ITEM"), M("LIST")],
  data_lengthoflist: [REPORTER, M("LIST")],
  data_listcontainsitem: [BOOLEAN, M("LIST"), S("ITEM")],
  data_hidelist: [OP, M("LIST")],
  data_showlist: [OP, M("LIST")],
  
  strarg: [REPORTER, M("VALUE")],
  boolarg: [BOOLEAN, M("VALUE")],
  
  argument_reporter_string_number: [REPORTER, M("VALUE")],
  argument_reporter_boolean: [BOOLEAN, M("VALUE")]
};

const _blocksDefinition = Object.keys(blocks).reduce((acc, cur) => {
  const def = blocks[cur];
  let op = def.shift();
  let negativeLookahead = "";
  if (Array.isArray(op)) {
    negativeLookahead = `(?!${op[1]})`;
    op = op[0];
  }
  if (def.length === 0) def.push(NOARG);
  const key = op + def.map(c => c.code).join("");
  if (typeof acc[key] === "undefined") {
    acc[key] = "";
  } else {
    acc[key] += "|";
  }
  acc[key] += cur;
  acc[key] += negativeLookahead;
  return acc;
}, Object.create(null));

const blocksDefinition = Object.keys(_blocksDefinition).reduce((acc, cur) => {
  acc[cur] = new RegExp(_blocksDefinition[cur]);
  return acc;
}, Object.create(null));

const aliases = {
  add: "operator_add",
  sub: "operator_subtract",
  mul: "operator_multiply",
  div: "operator_divide",
  mod: "operator_mod",
  mt_rand: "operator_random",
  lt: "operator_lt",
  eq: "operator_equals",
  strcasecmp: "operator_equals",
  gt: "operator_gt",
  and: "operator_and",
  or: "operator_or",
  not: "operator_not",
  join: "operator_join",
  strlen: "operator_length",
  stristr: "operator_contains",
  round: "operator_round",
  var: "data_variable",
  assign: "data_setvariableto",
  list: "data_listcontents",
  strarg: "argument_reporter_string_number",
  boolarg: "argument_reporter_boolean"
};

const cap = ["control_forever", "control_delete_this_clone"];

module.exports = {blocksDefinition, aliases, cap};