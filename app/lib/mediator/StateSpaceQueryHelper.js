import {download} from '../util/FileUtil';
import {is} from "bpmn-js/lib/util/ModelUtil";

export function exportQuery(objectives, goal) {
    const query = compileQuery(objectives, goal);
    console.log(query)
    //download('query.txt', query);
    return;
}

function compileQuery(objectives, goal) {
    let query = `use(ogpath^"ASKCTL/ASKCTLloader.sml");\n`;
    const orderedObjectives = orderObjectives(objectives, goal)

    let objectiveEvaluations = ''

    let goalEvaluation = `val Goal = `
    let goalEvaluationClosing = ''

    let preliminaryFunctions = new Set()

    orderedObjectives.forEach((objective, objeciveIdx) => {
        const {objectiveFunction, objectiveFunctionName, newFunctions} = getObjectiveFunction(objective)
        newFunctions.forEach(fun => 
            preliminaryFunctions.add(fun)
        )
        objectiveEvaluations += objectiveFunction
        goalEvaluation += `POS(NF("Objective${objeciveIdx}", ${objectiveFunctionName}`
        if (objeciveIdx < orderedObjectives.length - 1) goalEvaluation += ' andalso ';
        goalEvaluationClosing += '))'
    })

    for (const fun of preliminaryFunctions) {
        query += fun
    }

    let evaluation = "eval_node Goal 1;"

    return query + objectiveEvaluations + goalEvaluation + goalEvaluationClosing + ';\n' + evaluation;
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
    const name = `${object.name}Of${object.class}IsIn${object.state}`
    // TODO: also check ID
    let objectFunction = `fun ${name} n = (`
    objectFunction += `length(Mark.${mainPage}'${object.class}__${object.state} 1 n) <> 0`;
    objectFunction += `);\n`
    return {name, objectFunction}
}


function orderObjectives(objectives, goal) {
  const goalDependencies = goal.goals[0].Elements.filter(element => is(element, 'dep:Dependency'))
  const goalObjectives = goal.goals[0].Elements.filter(element => is(element, 'dep:Objective'))
  const firstObjective = goalObjectives.find((objective) => goalDependencies.every(dependency => dependency.targetObjective.id !== objective.id))
  let orderedObjectives = [firstObjective]
  //TODO: Add correct sorting

  orderedObjectives = objectives.map((objective, objectiveIdx) => ({
      name: `Objective${objectiveIdx}`,
      objects: objective.boardElements?.map(element => ({
          name: element.instance?.name ?? null,
          class: element.classRef?.name ?? null,
          state: element.state?.name ?? null,
      })) ?? []
  }))
  return orderedObjectives
}

const mainPage = "Main_Page";

function replaceWhiteSpace(input) {
  if (!input) return "";
  return input.replaceAll(" ", "_").replaceAll("\n", "_");
}

function replaceWhiteSpaceAndCapitalize(input) {
  if (!input) return "";
  return replaceWhiteSpace(input.toUpperCase());
}

function replaceWitheSpaceAndLowerCase(input) {
  if (!input) return "";
  return replaceWhiteSpace(input.toLowerCase());
}

export function compileAskCTLFormula(
  name,
  objective,
  state,
  dataObjects
) {
  let formula = `use(ogpath^"ASKCTL/ASKCTLloader.sml");`;

  formula += getDataObjectStateFunctions(dataObjects);

  const { functions, evaluation } = getObjectiveEvaluation(
    objective.conditions,
    objective.logicConcatenations,
    dataObjects
  );

  functions.forEach((helperFunction) => {
    if (!formula.includes(helperFunction.name))
      formula += helperFunction.function;
  });

  formula += `fun evaluateState n = (${evaluation});\n`;

  const objectiveFunction = `val Objective = POS(NF("${replaceWhiteSpace(
    name
  )}", evaluateState));`;

  const evaluate = `fun evaluateNode a = 
    let val destNode = DestNode(a)
    in eval_node Objective destNode
  end
  val nextArcs: int list ref = ref [];
  val results: (TI.TransInst * bool) list ref = ref([]);
  nextArcs := OutArcs(${state});
  results := List.map(fn (action) => (
      (ArcToTI(action), evaluateNode(action) )
  ))(!nextArcs);
  results;`;

  formula += objectiveFunction + `\n` + evaluate;
  return formula;
}

function getDataObjectStateFunctions(dataObjects) {
  let result = "";
  dataObjects.forEach((dataObject) =>
    dataObject.states.forEach((state) => {
      const dataObjectStateFunction = getDataObjectStateFunction(
        dataObject,
        state
      );
      result += `${dataObjectStateFunction}\n`;
    })
  );
  return result;
}

function getDataObjectStateFunction(dataObject, state) {
  const name = getDataObjectStateFunctionName(dataObject.name, state.name);
  const formula = `fun ${name} n = (length(Mark.${mainPage}'${replaceWitheSpaceAndLowerCase(
    dataObject.name
  )}__${replaceWhiteSpaceAndCapitalize(state.name)} 1 n) <> 0);`;

  return formula;
}

function getDataObjectStateFunctionName(dataObjectName, stateName) {
  return `${replaceWhiteSpace(dataObjectName)}Has${replaceWhiteSpace(
    stateName
  )}`;
}

function getDataObjectStateAmountFunction(
  dataObject,
  state,
  lowerBound,
  upperBound
) {
  const name = `${replaceWhiteSpace(
    dataObject
  )}Has${lowerBound}To${upperBound}${replaceWhiteSpace(state)}`;

  const lowerBoundCondition = `length(Mark.${mainPage}'${replaceWitheSpaceAndLowerCase(
    dataObject
  )}__${replaceWhiteSpaceAndCapitalize(state)} 1 n) >= ${lowerBound}`;

  const upperBoundCondition = `length(Mark.${mainPage}'${replaceWitheSpaceAndLowerCase(
    dataObject
  )}__${replaceWhiteSpaceAndCapitalize(state)} 1 n) <= ${upperBound}`;

  let formula = `fun ${name} n = (`;

  if (
    (!lowerBound && !upperBound) ||
    (!!lowerBound && !!upperBound && lowerBound > upperBound)
  ) {
    formula += "false";
  } else if (!!lowerBound && !!upperBound) {
    formula += `(${lowerBoundCondition}) andalso (${upperBoundCondition})`;
  } else if (!!lowerBound && !upperBound) {
    formula += `${lowerBoundCondition}`;
  } else if (!lowerBound && !!upperBound) {
    formula += `${upperBoundCondition}`;
  }

  formula += ");";

  return {
    name,
    formula,
  };
}

function getDataObjectOnlyStateFunction(dataObject, onlyState) {
  const name = `${replaceWhiteSpace(dataObject.name)}HasOnly${replaceWhiteSpace(
    onlyState
  )}`;
  let formula = `fun ${name} n = (`;

  dataObject.states.forEach((state, stateIdx) => {
    if (state.name === onlyState)
      formula += `${getDataObjectStateFunctionName(
        dataObject.name,
        state.name
      )}(n)`;
    else
      formula += `not(${getDataObjectStateFunctionName(
        dataObject.name,
        state.name
      )}(n))`;

    if (dataObject.states.length > stateIdx + 1) formula += " andalso ";
  });

  formula += ");";

  return {
    name,
    formula,
  };
}

function getActivityFunctions(activities) {
  let result = "";
  activities.forEach((activity) => {
    const activityFunction = getActivityFunction(activity);
    result += `${activityFunction}\n`;
  });
  return result;
}

function getActivityFunction(activity) {
  const name = getActivityFunctionName(activity.name);
  if (activity.inputOutputCombinations < 1) return `fun ${name} n = (false)\n`;
  let formula = `fun ${name} n = (if length(OutArcs(n)) <> 0 then
            (`;
  for (let i = 0; i < activity.inputOutputCombinations; i++) {
    formula += `List.exists(fn arc => ArcToTI(arc) = (TI.${replaceWhiteSpace(
      activity.name
    )}'${replaceWhiteSpace(activity.name)}_${i} 1)) (OutArcs(n))`;
    if (i < activity.inputOutputCombinations - 1) formula += "  orelse\n";
  }
  formula += `)\nelse false);`;
  return formula;
}

function getActivityFunctionName(activityName) {
  return `is${replaceWhiteSpace(activityName)}Enabled`;
}

function getObjectiveEvaluation(conditions, logicConcatenations, dataObjects) {
  let functions = [];
  let evaluation = "";
  conditions.forEach((condition, conditionIdx) => {
    let functionName =
      condition.type === "DATA_OBJECT"
        ? getDataObjectStateFunctionName(
            condition.selectedDataObjectState.name,
            condition.selectedDataObjectState.state
          )
        : getActivityFunctionName(condition.selectedActivity);
    if (condition.not) evaluation += " not(";
    if (condition.type === "DATA_OBJECT" && condition.quantor === "ALL") {
      const {
        name: allFunctionName,
        formula: allFunctionFormula,
      } = getDataObjectOnlyStateFunction(
        dataObjects.find(
          (dataObject) =>
            dataObject.name === condition.selectedDataObjectState.name
        ),
        condition.selectedDataObjectState.state
      );
      functions.push({
        name: allFunctionName,
        function: `${allFunctionFormula}\n`,
      });
      evaluation += `${allFunctionName}(n)`;
    } else if (
      condition.type === "DATA_OBJECT" &&
      condition.quantor === "AMOUNT"
    ) {
      const {
        name: amountFunctionName,
        formula: amountFunctionFormula,
      } = getDataObjectStateAmountFunction(
        condition.selectedDataObjectState.name,
        condition.selectedDataObjectState.state,
        condition.amount.lowerBound,
        condition.amount.upperBound
      );
      functions.push({
        name: amountFunctionName,
        function: `${amountFunctionFormula}\n`,
      });
      evaluation += `${amountFunctionName}(n)`;
    } else evaluation += `${replaceWhiteSpace(functionName)}(n)`;
    if (condition.not) evaluation += " ) ";
    evaluation += ` ${logicConcatenations[conditionIdx] ?? ""} `;
  });
  return { functions, evaluation };
}
