import {download} from './lib/util/FileUtil';

export function exportQuery(objectives) {
    const query = compileQuery(objectives);
    console.log(query)
    //download('query.txt', query);
    return;
}

function compileQuery(objectives) {
    let query = `use(ogpath^"ASKCTL/ASKCTLloader.sml");\nopen List;\n`;
    const parsedObjectives = parseObjectives(objectives)
    console.log(parsedObjectives)

    let objectiveEvaluations = ''

    let goalEvaluation = `val Goal = (`
    let goalEvaluationClosing = ''

    let preliminaryFunctions = new Set()

    parsedObjectives.forEach((objective, objeciveIdx) => {
        const {objectiveFunction, objectiveFunctionName, newFunctions} = getObjectiveFunction(objective)
        newFunctions.forEach(fun => 
            preliminaryFunctions.add(fun)
        )
        objectiveEvaluations += objectiveFunction;
        goalEvaluation += `AND (POS(NF("Objective${objeciveIdx}", ${objectiveFunctionName})),`;
        if (objeciveIdx == parsedObjectives.length - 1) goalEvaluation += ' TT)';
        goalEvaluationClosing += ');\n'
    })

    for (const fun of preliminaryFunctions) {
        query += fun
    }

    let evaluation = `fun evaluateNode a =
    let val destNode = DestNode(a)
    in eval_node Goal destNode
    end
    val nextArcs: int list ref = ref [];
    val results: (TI.TransInst * bool) list ref = ref([]);
    nextArcs := OutArcs(1);
    results := List.map(fn (action) => (
      (ArcToTI(action), evaluateNode(action) )
      ))(!nextArcs);
    results;`;

    return query + objectiveEvaluations + goalEvaluation + goalEvaluationClosing + evaluation;
}

function getObjectiveFunction(objective) {
    const name = `check${objective.name}`;
    const newFunctions = []
    let objectiveFunction = `fun ${name} n = (`
    objective.objects.forEach((object, objectIdx) => {
        const {name, objectFunction} = getObjectFunction(object)
        newFunctions.push(objectFunction)
        objectiveFunction += `${name}(n) `
        if (objectIdx < objective.objects.length - 1) objectiveFunction += 'andalso '
    })
    objectiveFunction += ');\n'
    return {objectiveFunction, objectiveFunctionName: name, newFunctions}
}

function getObjectFunction(object) {
    // function name
    const name = `${object.name ?? 'any'}Of${object.class}IsIn${object.states.length ? object.states.join("") : 'any'}`
    // function boilerplate
    let objectFunction = `fun ${name} n = (isSome(find( fn (token: DATA_OBJECT) => (`
    // check the object's id
    objectFunction += `${object.name ? '(#id token) = "' + object.name + '")' : ''} `
    // concatenate if necessary
    if(object.states.length >= 0 && object.name) objectFunction += ' andalso ('
    // add condition for every state
    object.states.forEach((state, stateIdx) => {
      objectFunction += `(#state token) = ${state}`;
      if (stateIdx < object.states.length - 1) objectFunction += ' orelse '
    })
    // end concatenation if necessary
    if(object.states.length >= 0 && object.name) objectFunction += ')'
    // set default if nothing is required
    if(!object.states.length && ! object.name) objectFunction += 'TT'
    // function boilerplate
    objectFunction += `)(Mark.Main_Page'${object.class} 1 n)));\n`
    return {name, objectFunction}
}


function parseObjectives(objectives) {
  console.log(objectives)

  const parsedObjectives = objectives.map((objective, objectiveIdx) => ({
      name: `Objective${objectiveIdx}`,
      objects: objective.dataObjectNodes?.map(node => ({
          name: node.dataObjectInstance?.name ? replaceWhiteSpaceAndLowercase(node.dataObjectInstance.name) : null,
          class: node.dataObjectInstance?.dataclass?.name ? replaceWhiteSpaceAndLowercase(node.dataObjectInstance.dataclass.name):  null,
          states: node.states.map(state => replaceWhiteSpaceAndCapitalize(state)),
      })) ?? []
  }))
  return parsedObjectives
}

function replaceWhiteSpace(input) {
  if (!input) return "";
  return input.replaceAll(" ", "_").replaceAll("\n", "_");
}

function replaceWhiteSpaceAndCapitalize(input) {
  if (!input) return "";
  return replaceWhiteSpace(input.toUpperCase());
}

function replaceWhiteSpaceAndLowercase(input) {
  if (!input) return "";
  return replaceWhiteSpace(input.toLowerCase());
}
