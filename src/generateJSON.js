const {generateID, fail, assert} = require("./util.js");
const {blocks: blocksDefinition, cBlocks: cBlockDefinition, cap, BooleanType} = require("./blocks.js");

const BOOL_EMPTY = Symbol.for("tosh3.grammar.BOOL_EMPTY");

const sort = result => result.sort((a, b) => {
  const aIsDef = a[0].op.type === "proceduredefinesyntax";
  const bIsDef = b[0].op.type === "proceduredefinesyntax";
  if (aIsDef === bIsDef) return 0;
  return bIsDef - aIsDef;
});

class Procedure {
  constructor (name, warp, args, blocksRef) {
    this.name = name;
    fail(name.includes("%"), `Procedure name may not contain percent: ${name}`);
    fail(name in ({}), `Object prototype names are not permitted for procedures: ${name}`);
    this.warp = warp;
    this.args = args;
    this._argInputId = args.map(() => generateID());
    this._blocksRef = blocksRef;
    this.mutation = null;
  }
  
  get ARG_TYPE () {
    return ({
      reportertype: '%s',
      booltype: '%b'
    });
  }
  
  get ARG_TO_OP () {
    return ({
      reportertype: "argument_reporter_string_number",
      booltype: "argument_reporter_boolean"
    });
  }
  
  toProccode () {
    const argsPercent = this.args.map(arg => this.ARG_TYPE[arg.type.type]).join(" ");
    return `${this.name} ( ${argsPercent} )`;
  }
  
  matchesType (callArgs) {
    assert(callArgs.length === this.args.length, `Procedure ${this.name} argument counts didn't match`);
    const _MAP = ["reportable", "boolable"];
    return this.args.every((cur, idx) => {
      const callArg = callArgs[idx];
      const callArgIsBool = callArg === BOOL_EMPTY || (callArg.op && callArg.op.type.startsWith("bool"));
      const argIsBool = arg.type.type === "boolreporter";
      return assert(argIsBool === callArgIsBool, `Procedure ${this.name} argument mismatch; expected ${_MAP[argIsBool]}, received ${_MAP[callArgIsBool]}`);
    });
  }
  
  makeArgBlock (arg, mutationId) {
    const id = generateID();
    this._blocksRef[id] = {
      opcode: this.ARG_TO_OP[arg.type.type],
      next: null,
      parent: mutationId,
      inputs: {},
      fields: {
        VALUE: [arg.name.value, null]
      },
      shadow: true,
      topLevel: false
    };
    return id;
  }
  
  addDefinitionBlock (x, y) {
    const definitionId = generateID();
    
    const mutationId = generateID();
    
    const argShadowId = args.map(() => generateID());
    const blockToShadow = this._argInputId.reduce((acc, cur, idx) => {
      acc[cur] = [1, argShadowId[idx]];
      return acc;
    }, {});
    this.args.forEach((val, idx) => {
      const blockIdForArg = this._argInputId[idx];
      const shadowIdForArg = blockToShadow[blockIdForArg][1];
      this._blocksRef[shadowIdForArg] = {
        opcode: this.ARG_TO_OP[val.type.type],
        next: null,
        parent: mutationId,
        inputs: {},
        fields: {
          VALUE: [val.name.value, null]
        },
        shadow: true,
        topLevel: false
      };
    })
    
    this._blocksRef[mutationId] = this.mutation = {
      opcode: "procedures_prototype",
      next: null,
      parent: definitionId,
      fields: {},
      inputs: blockToShadow,
      shadow: true,
      topLevel: false,
      mutation: {
        tagName: "mutation",
        children: [],
        proccode: this.toProccode(),
        argumentids: JSON.stringify(this._argInputId),
        argumentnames: JSON.stringify(this.args.map(arg => arg.name.value)),
        argumentdefaults: JSON.stringify(
          this.args.map(arg => arg.type.type === "boolreporter" ? "false" : "")
        ),
        warp: String(!!this.warp)
      }
    };
    
    this._blocksRef[definitionId] = {
      opcode: "procedures_definition",
      next: null,
      parent: null,
      fields: {},
      inputs: {
        custom_block: [1, mutationId]
      },
      shadow: false,
      topLevel: true,
      x,
      y
    };
    
    return definitionId;
  }
}

class Generator {
  constructor (project, target, procedureMap, blocksRef) {
    this.project = project;
    this.target = target;
    this.procedureMap = procedureMap;
    this.blocksRef = blocksRef;
    
    this._stage = project.targets.find(t => t.isStage);
    assert(this._stage, "Stage not found");
    
    this._shadowBroadcastID = generateID();
    this._stage.broadcasts[this._shadowBroadcastID] = this._shadowBroadcastID;
  }
  
  validateBackdrop (name) {
    return assert(this._stage.costumes.some(c => c.name === name), `Invalid backdrop: ${name}`);
  }
  
  _getVariableForTarget (target, name) {
    return Object.keys(target.variables).find(varId => {
      const variableValue = target.variables[varId];
      return variableValue[0] === name;
    });
  }
  
  validateVariable (name) {
    let variableId = this._getVariableForTarget(this._stage, name);
    if (!variableId) {
      variableId = this._getVariableForTarget(this.target, name);
    }
    assert(variableId, `Invalid variable name: ${name}`);
    return variableId;
  }
  
  validateList (name) {
    let listId = Object.keys(this._stage.lists).find(lid => {
      const listValue = this._stage.lists[lid];
      return listValue[0] === name;
    });
    if (!variableId) {
      listId = Object.keys(this.target.lists).find(lid => {
        const listValue = this.target.lists[lid];
        return listValue[0] === name;
      });
    }
    assert(listId, `Invalid list name: ${name}`);
    return listId;
  }
  
  validateBroadcast (name) {
    const broadcastId = Object.keys(this._stage.broadcasts).find(bid => this._stage.broadcasts[bid] === name);
    assert(broadcastId, `Invalid broadcast name: ${name}`);
    return broadcastId;
  }
  
  validateSensingOf (secondArg, value) {
    if (value === "volume") return true;
    const isStage = secondArg.type !== "string" || secondArg.value === "_stage_";
    let target;
    if (isStage) {
      target = this._stage;
      if (["backdrop #", "backdrop name"].includes(value)) return true;
    } else {
      target = this.target;
      if (["costume #", "costume name", "x position", "y position", "direction", "size"].includes(value)) return true;
    }
    assert(this._getVariableForTarget(target, value), `sensing_of received invalid argument: ${value}`);
    return value;
  }
  
  validateAndAddBlock (block, parentId) {
    if (block.op.type === "procedurecallsyntax") {
      const proc = this.procedureMap[block.proname.value];
      assert(proc, `Unknown procedure passed to procedure_call: ${procname}`);
      proc.matchesType(block.args);
    }
    const blockId = generateID();
    const sb3Block = {
      shadow: false,
      opcode: block.op.value,
      parent: parentId || null,
      next: null,
      fields: {},
      inputs: {},
      topLevel: block.op.type && block.op.type.startsWith("hat")
    };
    let {args} = block;
    const isCBlock = cBlockDefinition[block.op.value];
    let substacks = [];
    if (isCBlock) {
      substacks = args.slice(1);
      args = [args[0]];
    }
    if (blocksDefinition[block.op.value] || isCBlock) {
      const def = (blocksDefinition[block.op.value] || isCBlock).slice(0);
      def.shift();
      assert(args.length === def.length, `Argument count mismatch: expected ${def.length}, found ${args.length}`);
      let i = -1;
      for (const argDef of def) {
        i++;
        const arg = args[i];
        if (arg === BOOL_EMPTY) continue;
        const blockInputRepr = [];
        if (arg.op && arg.args) {
          // Block inserted. Not fields.
          if (arg.op.value === "data_variable" || arg.op.value === "data_listcontents") {
            const insertedBlockRepr = [];
            const varId = arg.args[0].value;
            if (arg.op.value === "data_variable") {
              insertedBlockRepr.push(12);
              insertedBlockRepr.push(varId);
              insertedBlockRepr.push(this.validateVariable(varId));
            } else {
              insertedBlockRepr.push(13);
              insertedBlockRepr.push(varId);
              insertedBlockRepr.push(this.validateList(varId));
            }
            blockInputRepr.push(3);
            blockInputRepr.push(insertedBlockRepr);
            blockInputRepr.push(argDef.shadow());
            sb3Block.inputs[argDef.inputName] = blockInputRepr;
            continue;
          }
          blockInputRepr.push(this.validateAndAddBlock(arg, blockId));
          if (argDef instanceof BooleanType) {
            blockInputRepr.unshift(2);
          } else {
            blockInputRepr.unshift(3);
            if (argDef.inputName === "BROADCAST_INPUT") {
              blockInputRepr.push([11, this._shadowBroadcastID, this._shadowBroadcastID]);
            } else {
              blockInputRepr.push(argDef.shadow());
            }            
          }
          sb3Block.inputs[argDef.inputName] = blockInputRepr;
          continue;
        }
        // Not boolean.
        let handled = true;
        switch (argDef.inputName) {
          case "VARIABLE":
            sb3Block.fields.VARIABLE = [arg.value, this.validateVariable(arg.value)];
            break;
          case "LIST":
            sb3Block.fields.LIST = [arg.value, this.validateList(arg.value)];
            break;
          case "BROADCAST_OPTION":
            sb3Block.fields.BROADCAST_OPTION = [arg.value, this.validateBroadcast(arg.value)];
            break;
          case "PROPERTY":
            sb3Block.fields.PROPERTY = [this.validateSensingOf(args[1], arg.value), null];
            break;
          default:
            handled = false;
        }
        if (handled) continue;
        if (block.op.value === "event_whenbackdropswitchesto") {
          this.validateBackdrop(arg.value);
          sb3Block.fields.BACKDROP = [arg.value, null];
          continue;
        }
        const validity = argDef.isValid(arg.value);
        const invalidMsg = `Invalid argument value ${arg.value} for ${block.op.value}[${i}]`;
        fail(validity === false, invalidMsg);
      }
      return true;
    }
  }
  
  isCap (block) {
    return cap.includes(block.op) || (block.op === "control_stop" && block.args[0].value !== 	"other scripts in sprite");
  }
}

const generateJSON = (result, project, spriteName) => {
  const sorted = sort(result.slice(0));
  const blocksRef = {};
  const procedureMap = Object.create(null);
  for (const script of sorted) {
    const top = script[0];
    if (top.op.type === "proceduredefinesyntax") {
      procedureMap[top.name.value] = new Procedure(top.name.value, top.warp, top.args, blocksRef);
    }
  }  
  const editingTarget = project.targets.find(t => t.name === spriteName);
  let x = 0;
  let y = 0;
  let nextXY = 0;
  const getXY = () => {
    [
      () => x++,
      () => y++
    ][nextXY^=1]();
    return [x*10, y*10];
  };
  
  const generator = new Generator(project, editingTarget, procedureMap, blocksRef);
  
  const makeStackBlock = (block, parentId) => {
    const blockId = generateID();
    if (parentId) blocksRef[parentId].next = blockId;
    const newBlock = {
      opcode: block.op,
      parent: parentId || null,
      next: null,
      shadow: false,
      topLevel: false
    };
    return blockId;
  }
};