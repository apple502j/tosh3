const sort = result => result.sort((a, b) => {
  const aIsDef = a[0].op.type === "proceduredefinesyntax";
  const bIsDef = b[0].op.type === "proceduredefinesyntax";
  if (aIsDef === bIsDef) return 0;
  return bIsDef - aIsDef;
});

const usedIDs = new Set();
const generateID = () => {
  const n = Math.random() * 1e15;
  const m = n.toString(36).toUpperCase();
  if (usedIDs.has(m)) return generateID();
  usedIDs.add(m);
  return m;
};

const fail = (cond, message) => {
  if (cond) throw new Error(message);
};

class Procedure {
  constructor (name, warp, args, blocksRef) {
    this.name = name;
    fail(name.includes("%"), `Procedure name may not contain percent: ${name}`);
    fail(name in ({}), `Object prototype names are not permitted for procedures: ${name}`);
    this.warp = warp;
    this.args = args;
    this._argInputId = args.map(() => generateID());
    this._blocksRef = blocksRef;
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
    
    this._blocksRef[mutationId] = {
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
        warp: String(this.warp)
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

const generateJSON = result => {
  const sorted = sort(result.slice(0));
  const procedureMap = Object.create(null);
}