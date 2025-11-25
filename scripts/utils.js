// {
// problemCount: number,      // Required: 10, 20, 50, 100, 120, 150, 180, 200
// answerFormat: string,            // Required: "fill-in-blank", "multiple-choice", "both"
// displayFormat: string,     // Required: "side-by-side", "stacked", "both"
// problemSets: [{
//     operation: string,        // Required: "+", "-", "*", or "/"
//     numberCount: number,      // Required: 2, 3, 4, or 5
//     numberRanges: [           // Required: Array of range objects
//       {
//         min: number,          // Minimum value for this number
//         max: number           // Maximum value for this number
//       },
//       // ... more ranges matching numberCount
//     ],
//     allowNegative?: boolean,  // Optional: For subtraction operations
//     allowDecimalAnswers?: boolean,  // Optional: For division operations
//     decimalPrecision?: number      // Optional: For division operations (default: 2)
//   }]
// }


// {
//   expression: string,           // The math expression as a string (e.g., "5 + 3", "10 - 4", "2 × 6", "12 ÷ 3")
//   answer: number,               // The correct answer (rounded based on precision settings)
//   wrongAnswers: number[],       // Array of 3 wrong answers (only for multiple-choice format)
//   answerFormat: string,               // 'fill-in-blank', 'multiple-choice', or 'both'
//   displayFormat: string,         // 'side-by-side', 'stacked', or 'both'
//   numbers: number[],            // Array of the actual numbers used in the problem
//   operation: string,            // The operation: '+', '-', '*', or '/'
//   problemSet: object            // Reference to the problem set configuration that generated this problem
// }

const MAX_PROBLEM_COUNT = 200

/**
 * Gets the answer format for a problem at the given index
 * @param {number} index - The index of the problem (0-based)
 * @param {Object} studySet - The study set configuration
 * @param {string} currentAnswerFormat - The current answer format (first format when "both")
 * @returns {string} - The answer format for this problem
 */
function getAnswerFormat(index, studySet, currentAnswerFormat) {
    if (studySet.answerFormat !== "both") {
        return studySet.answerFormat
    }
    
    // Start with one of the first format, then alternate in groups of 2
    if (index === 0) {
        return currentAnswerFormat
    }
    
    // After the first one, alternate in groups of 2
    const adjustedCounter = index + 1
    if (adjustedCounter % 4 < 2) {
        return currentAnswerFormat
    } else {
        return currentAnswerFormat == "fill-in-blank" ? "multiple-choice" : "fill-in-blank"
    }
}

/**
 * Gets the display format for a problem at the given index
 * @param {number} index - The index of the problem (0-based)
 * @param {Object} studySet - The study set configuration
 * @param {string} currentDisplayFormat - The current display format (first format when "both")
 * @returns {string} - The display format for this problem
 */
function getDisplayFormat(index, studySet, currentDisplayFormat) {
    if (studySet.displayFormat !== "both") {
        return studySet.displayFormat
    }
    
    // Start with one of the first format, then alternate in groups of 2
    if (index === 0) {
        return currentDisplayFormat
    }
    
    // After the first one, alternate in groups of 2
    const adjustedCounter = index
    if (adjustedCounter % 4 < 2) {
        return currentDisplayFormat
    } else {
        return currentDisplayFormat == "side-by-side" ? "stacked" : "side-by-side"
    }
}

/**
 * This function generates the wrong answers for a given answer
 * @param {number} answer - The correct answer
 * @returns {Array} - The wrong answers
 */
function generateWrongAnswers(problem, allowNegative) {
    let isDecimal = problem.answer % 1 !== 0
    let wrongAnswers = []
    for (let i = 0; i < 3; i++) {
        let wrong = problem.answer + Math.floor(Math.random() * 20) - 10;
        while (wrong === problem.answer || wrongAnswers.includes(wrong) || !allowNegative && wrong < 0) {
            wrong = problem.answer + Math.floor(Math.random() * 20) - 10;
        }
        if (isDecimal) {
            wrong += Math.random()
        }
        wrongAnswers.push(wrong);
    }
    return wrongAnswers
}


/**
 * This function rounds an answer based on the decimal precision setting
 * @param {number} answer - The answer to round
 * @param {number} decimalPrecision - The decimal precision to round to
 * @returns {number} - The rounded answer
 */
function roundAnswer(answer, allowDecimalAnswers, decimalPrecision) {
    if (allowDecimalAnswers && decimalPrecision) {
        const precision = Math.pow(10, decimalPrecision || 2);
        answer = Math.round(answer * precision) / precision;
    } else {
        answer = Math.round(answer * 100) / 100; // Default to 2 decimal places
    }

    return answer
}

/**
 * This function generates the problems for a given problem set
 * @param {Object} problemSet - The problem set to generate the problems for
 * @returns {Array} - The generated problems
 */
function generateProblems(problemSet){
    // this is used to keep track of the expressions that have been generated
    let expressions = []
    // this is used to keep track of the invalid expressions that have been generated
    let invalidExpressions = []

    // this is used to keep track of the number range segments that have been generated
    let numberRangesSegments = []
    // this is used to keep track of the full count of all the possible combinations
    let fullCount = 0
    // generate number range segments for each number range and get a count of all the possible combinations
    for (let numberRange of problemSet.numberRanges) {
        // generate the number range segments
        let numberRangeSegments = generateNumberRangeSegments(numberRange.min, numberRange.max, problemSet.problemCount).sort(()=>(Math.random() > 0.5 ? -1 : 1))
        numberRangesSegments.push(numberRangeSegments)
        // calculate the full count of all the possible combinations
        if (fullCount == 0){
            fullCount = numberRange.max - numberRange.min + 1
        } else {
            fullCount = fullCount * (numberRange.max - numberRange.min + 1)
        }
    }

    // this will limit the number of problems to try to generate
    let count = Math.min(problemSet.problemCount, fullCount, MAX_PROBLEM_COUNT)
        
    // generate problem data
    let problems = [];
    for (let i = 0; i < count; i++) {
        let problem = {}

        problem.numbers = generateProblemNumbers(numberRangesSegments, i)
        problem.expression = generateProblemExpression(problem.numbers, problemSet.operation)
        problem.answer = roundAnswer(eval(problem.expression), problemSet.allowDecimalAnswers, problemSet.decimalPrecision)
        problem.problemSet = problemSet
        problem.operation = problemSet.operation
        
        // check if the problem is invalid
        let invalidExpression = detectInvalidExpression(problem.answer, problemSet.allowDecimalAnswers, problemSet.allowNegative)
        // if its invalid and not already in the invalid expressions array, add it to the invalid expressions array 
        // and decrement the full count
        if (invalidExpression && !invalidExpressions.includes(problem.expression)) {
            invalidExpressions.push(problem.expression)
            fullCount--
            if (fullCount < count) {
                count = fullCount
            }
        }
        
        // if the problem is already generated or invalid, shuffle the number range segments and decrement the index
        if (expressions.includes(problem.expression) || invalidExpression) {
            numberRangesSegments = shuffleNumberRangeSegments(numberRangesSegments)
            i--
        } else { // if the problem is valid, add it to the problems array and the expressions array
            problem.wrongAnswers = generateWrongAnswers(problem, problemSet.allowDecimalAnswers, problemSet.allowNegative)
            problems.push(problem)
            expressions.push(problem.expression)
        }
    }

    return problems
}

/**
 * This function generates the problem numbers for a given problem
 * @param {Array} numberRangesSegments - The number range segments to generate the problem numbers from
 * @param {number} i - The index of the problem to generate the numbers for
 * @returns {Array} - The problem numbers
 */
function generateProblemNumbers(numberRangesSegments, i) {
    let problemNumbers = []
    for (let numberRangeSegments of numberRangesSegments) {
        let number = generateNumber(numberRangeSegments, i)
        problemNumbers.push(number)
    }
    return problemNumbers
}

/**
 * This function generates the number range segments for a given number range
 * @param {number} min - The minimum value of the number range
 * @param {number} max - The maximum value of the number range
 * @param {number} count - The count of the number range
 * @returns {Array} - The number range segments
 */
function generateNumberRangeSegments(min, max, count) {
    var fullRange = max-min+1
    var passes = Math.min(count, fullRange);
    var step = (max-min+1) / passes;
    if (step < 1) {
        step = 1;
    } 
    step = Math.floor(step);
    var extra = fullRange - (step * passes);
    if (extra < 0) {
        extra = 0;
    }
    
    let segments = []
    
    for (let j = 0; j < passes; j++) {
        // Distribute extra across segments - first 'extra' segments get one more number
        var segmentStep = step + (j < extra ? 1 : 0);
        // Calculate segment start: sum of all previous segment sizes
        var segmentStart = min;
        for (let k = 0; k < j; k++) {
            segmentStart += step + (k < extra ? 1 : 0);
        }
        var segmentEnd = segmentStart + segmentStep - 1;
        // Ensure we don't exceed max
        if (segmentEnd > max) {
            segmentEnd = max;
        }
        
        segments.push([segmentStart, segmentEnd])
    }

    return segments
}

/**
 * This function generates a number for a given number range segment
 * @param {Array} numberRangeSegments - The number range segments to generate the number from
 * @param {number} i - The index of the number range segment to generate the number from
 * @returns {number} - The generated number
 */
function generateNumber(numberRangeSegments, i) {
    i = wrapIndex(i, numberRangeSegments.length)

    let segmentStart = numberRangeSegments[i][0]
    let segmentEnd = numberRangeSegments[i][1]
    if (segmentEnd === segmentStart) {
        return segmentEnd
    }

    return Math.floor(Math.random() * (segmentEnd - segmentStart + 1)) + segmentStart
}

/**
 * This function detects if a given problem expression is invalid
 * @param {string} problemExpression - The problem expression to detect if is invalid
 * @param {boolean} allowDecimalAnswers - Whether to allow decimal answers
 * @param {boolean} allowNegative - Whether to allow negative answers
 * @returns {boolean} - Whether the problem expression is invalid
 */
function detectInvalidExpression(answer, allowDecimalAnswers, allowNegative) {
    return isNaN(answer) || !isFinite(answer) || (!allowDecimalAnswers && answer % 1 !== 0) || (!allowNegative && answer < 0)
}

/**
 * This function shuffles the number range segments
 * @param {Array} numberRangeSegments - The number range segments to shuffle
 * @returns {Array} - The shuffled number range segments
 */
function shuffleNumberRangeSegments(numberRangeSegments) {
    for (let i in numberRangeSegments) {
        numberRangeSegments[i] = numberRangeSegments[i].sort(()=>(Math.random() > 0.5 ? -1 : 1))
    }
    return numberRangeSegments
}

/**
 * This function generates a problem expression for a given set of problem numbers and operator
 * @param {Array} problemsNumbers - The problem numbers to generate the expression from
 * @param {string} operator - The operator to use in the expression
 * @returns {string} - The generated problem expression
 */
function generateProblemExpression(problemsNumbers, operator) {
    return problemsNumbers.join(" "+operator+" ")
}

/**
 * This function wraps an index around an array length
 * @param {number} index - The index to wrap
 * @param {number} arrayLength - The length of the array to wrap the index around
 * @returns {number} - The wrapped index
 */
function wrapIndex(index, arrayLength) {
    return (index % arrayLength + arrayLength) % arrayLength;
}


/**
 * This function generates the problems for a given study set
 * @param {Object} studySet - The study set to generate the problems for
 * @returns {Array} - The generated problems
 */
export function generateStudySetProblems(studySet){
    let problems = []
    let currentAnswerFormat = studySet.answerFormat == "both" ? 'fill-in-blank' : studySet.answerFormat
    let currentDisplayFormat = studySet.displayFormat == "both" ? 'side-by-side' : studySet.displayFormat
    let problemIndex = 0
    
    for (let problemSet of studySet.problemSets){
        let problemSetProblems = generateProblems(problemSet).map(problem => {
            problem.answerFormat = getAnswerFormat(problemIndex, studySet, currentAnswerFormat)
            problem.displayFormat = getDisplayFormat(problemIndex, studySet, currentDisplayFormat)
            problemIndex++
            return problem
        })
        problems.push(...problemSetProblems)
    }
    return problems
}
