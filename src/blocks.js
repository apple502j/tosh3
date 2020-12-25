const OP = "op";
const REPORTER = "rep";
const BOOLEAN = "bool";
const HAT = "hat";

const NOARG = "0arg";
const S = "S";
const N = "N";
const B = "B";
const M = "M";

const blocks = {
  motion_movesteps: [OP, N],
  motion_gotoxy: [OP, N, N],
  motion_goto: [OP, S],
  motion_turnright: [OP, N],
  motion_turnleft: [OP, N],
  motion_pointindirection: [OP, N],
  motion_pointtowards: [OP, S],
  motion_glidesecstoxy: [OP, N, N, N],
  motion_glideto: [OP, N, S],
  motion_ifonedgebounce: [OP],
  motion_setrotationstyle: [OP, M],
  motion_changexby: [OP, N],
  motion_setx: [OP, N],
  motion_changeyby: [OP, N],
  motion_sety: [OP, N],
  motion_xposition: [REPORTER],
  motion_yposition: [REPORTER],
  motion_direction: [REPORTER],
  
  looks_say: [OP, S],
  looks_sayforsecs: [OP, S, N],
  looks_think: [OP, S],
  looks_thinkforsecs: [OP, S, N],
  looks_show: [OP],
  looks_hide: [OP],
  looks_switchcostumeto: [OP, S],
  looks_switchbackdropto: [OP, S],
  looks_switchbackdroptoandwait: [OP, S],
  looks_nextcostume: [OP],
  looks_nextbackdrop: [OP],
  looks_changeeffectby: [OP, M, N],
  looks_seteffectto: [OP, M, N],
  looks_cleargraphiceffects: [OP],
  looks_changesizeby: [OP, N],
  looks_setsizeto: [OP, N],
  looks_gotofrontback: [OP, M],
  looks_goforwardbackwardlayers: [OP, M, N],
  looks_size: [REPORTER],
  looks_costumenumbername: [REPORTER, M],
  looks_backdropnumbername: [REPORTER, M],
  
  sound_play: [OP, S],
  sound_playuntildone: [OP, S],
  sound_stopallsounds: [OP],
  sound_seteffectto: [OP, M, N],
  sound_changeeffectby: [OP, M, N],
  sound_cleareffects: [OP],
  sound_setvolumeto: [OP, N],
  sound_changevolumeby: [OP, N],
  sound_volume: [REPORTER],
  
  event_whenflagclicked: [HAT],
  event_whenkeypressed: [HAT, M],
  event_whenthisspriteclicked: [HAT],
  event_whenbackdropswitchesto: [HAT, M],
  event_whengreaterthan: [HAT, M, N],
  event_whenbroadcastreceived: [HAT, M],
  event_broadcast: [OP, S],
  event_broadcastandwait: [OP, S],
  
  control_wait: [OP, N],
  control_wait_until: [OP, B],
  control_stop: [OP, M],
  control_create_clone_of: [OP, S],
  control_delete_this_clone: [OP],
  
  sensing_touchingobject: [BOOLEAN, S],
  sensing_touchingcolor: [BOOLEAN, N],
  sensing_coloristouchingcolor: [BOOLEAN, N, N],
  sensing_distanceto: [REPORTER, S],
  sensing_timer: [REPORTER],
  sensing_resettimer: [OP],
  sensing_of: [REPORTER, M, S],
  sensing_mousex: [REPORTER],
  sensing_mousey: [REPORTER],
  sensing_setdragmode: [OP, M],
  sensing_mousedown: [BOOLEAN],
  sensing_keypressed: [BOOLEAN, S],
  sensing_current: [REPORTER, M],
  sensing_dayssince2000: [REPORTER],
  sensing_loudness: [REPORTER],
  sensing_askandwait: [OP, S],
  sensing_answer: [REPORTER],
  sensing_username: [REPORTER],
  
  // Operators (PHP-like)
  add: [REPORTER, N, N],
  sub: [REPORTER, N, N],
  mul: [REPORTER, N, N],
  div: [REPORTER, N, N],
  mod: [REPORTER, N, N],
  lt: [BOOLEAN, S, S],
  eq: [BOOLEAN, S, S],
  strcasecmp: [BOOLEAN, S, S],
  gt: [BOOLEAN, S, S],
  and: [BOOLEAN, B, B],
  or: [BOOLEAN, B, B],
  not: [BOOLEAN, B],
  join: [REPORTER, S, S],
  strlen: [REPORTER, S],
  stristr: [BOOLEAN, S, S],
  round: [REPORTER, N],
  
  // Operators (Scratch-like)
  operator_add: [REPORTER, N, N],
  operator_subtract: [REPORTER, N, N],
  operator_multiply: [REPORTER, N, N],
  operator_divide: [REPORTER, N, N],
  operator_mod: [REPORTER, N, N],
  operator_lt: [BOOLEAN, S, S],
  operator_equals: [BOOLEAN, S, S],
  operator_gt: [BOOLEAN, S, S],
  operator_and: [BOOLEAN, B, B],
  operator_or: [BOOLEAN, B, B],
  operator_not: [BOOLEAN, B],
  operator_join: [REPORTER, S, S],
  operator_letter_of: [REPORTER, N, S],
  operator_length: [REPORTER, S],
  operator_contains: [BOOLEAN, S, S],
  operator_round: [REPORTER, N],
  operator_mathop: [REPORTER, M, N],
  
  var: [REPORTER, M],
  assign: [OP, M, S],
  list: [REPORTER, M],
  
  data_variable: [REPORTER, M],
  data_setvariableto: [OP, M, S],
  data_changevariableby: [OP, M, N],
  data_hidevariable: [OP, M],
  data_showvariable: [OP, M],
  data_listcontents: [REPORTER, M],
  data_addtolist: [OP, S, M],
  data_deleteoflist: [OP, N, M],
  data_deletealloflist: [OP, M],
  data_insertatlist: [OP, S, N, M],
  data_replaceitemoflist: [OP, N, M, S],
  data_itemoflist: [REPORTER, N, M],
  data_itemnumoflist: [REPORTER, S, M],
  data_lengthoflist: [REPORTER, M],
  data_listcontainsitem: [BOOLEAN, M, S],
  data_hidelist: [OP, M],
  data_showlist: [OP, M],
  
  argument_reporter_string_number: [REPORTER, M],
  argument_reporter_boolean: [BOOLEAN, M]
};

const blocksDefinition = Object.keys(blocks).reduce((acc, cur) => {
  const currentCat = blocks[cur];
  if (currentCat.length === 1) currentCat.push(NOARG);
  const typeName = currentCat.join("");
  if (typeof acc[typeName] === "undefined") acc[typeName] = [];
  acc[typeName].push(cur);
  return acc;
}, Object.create(null));

const aliases = {
  add: "operator_add",
  sub: "operator_subtract",
  mul: "operator_multiply",
  div: "operator_divide",
  mod: "operator_mod",
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
  list: "data_listcontents"
};

module.exports = {blocksDefinition, aliases};