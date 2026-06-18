import { pythonCourse } from './python.js';
import { javascriptCourse } from './javascript.js';
import { cCourse } from './c.js';
import { javaCourse } from './java.js';
import { cppCourse } from './cpp.js';

const COURSE_MILESTONES = {
  python: {
    5: [
      { concept: 'Variable', meaning: 'Stores dynamic data inside a labeled container' },
      { concept: 'Data Type', meaning: 'Specifies structure forms like integers, floats, or strings' },
      { concept: 'input()', meaning: 'Captures and reads typed inputs directly from the user' },
      { concept: 'print()', meaning: 'Outputs visual results or text messages to the standard console' },
      { concept: 'elif', meaning: 'Proposes alternative choices inside a conditional pipeline' }
    ],
    10: [
      { concept: 'Loop', meaning: 'Automates sequential repetitions over statements continuously' },
      { concept: 'Function', meaning: 'Groups named reusable sequences of operations' },
      { concept: 'List', meaning: 'Represents mutable ordered array lists' },
      { concept: 'Tuple', meaning: 'Defines unchangeable locked read-only lists' },
      { concept: 'Dictionary', meaning: 'Stores items matched as unique key-value bindings' }
    ],
    15: [
      { concept: 'Set', meaning: 'Defines unsorted unique de-duplicated elements lists' },
      { concept: 'f-string', meaning: 'Formats and injects live variables into printable strings' },
      { concept: 'import', meaning: 'References outside pre-packaged software modules' },
      { concept: 'open(\'w\')', meaning: 'Initiates a stream to construct and compile text files' },
      { concept: 'except', meaning: 'Blocks off and handles program execution errors gracefully' }
    ],
    20: [
      { concept: 'Class', meaning: 'Acts as structural abstract design template for objects' },
      { concept: 'Object', meaning: 'Represents live physical instantiations of classes' },
      { concept: 'Inheritance', meaning: 'Enables child layers to inherit base rules from parent shapes' },
      { concept: 'JSON', meaning: 'Universal lightweight format for transmitting dataset payloads' },
      { concept: 'Exception Handling', meaning: 'Guards overall systems against unhandled execution failure crashes' }
    ]
  },
  c: {
    5: [
      { concept: 'int', meaning: 'Reserves spaces for standard integer numbers' },
      { concept: 'char', meaning: 'Hosts individual basic alphanumeric characters' },
      { concept: 'printf()', meaning: 'Writes alphanumeric statements to the stdout output terminal' },
      { concept: 'scanf()', meaning: 'Stores input typing strings coordinates inside a variable' },
      { concept: 'index [0]', meaning: 'Indicates the starting element position of any array block' }
    ],
    10: [
      { concept: 'void', meaning: 'Signals that a function does not return any final outputs' },
      { concept: 'pointer *', meaning: 'Stores hardware address index locations of variables' },
      { concept: 'address &', meaning: 'Extracts the underlying reference coordinate of memory items' },
      { concept: 'struct', meaning: 'Bundles distinct datatypes together under a single name' },
      { concept: 'free()', meaning: 'Cleans up allocated heap storage blocks back to the core OS' }
    ]
  },
  java: {
    5: [
      { concept: 'class', meaning: 'Describes standard structural templates and methods blueprints' },
      { concept: 'main()', meaning: 'Serves as the executing entry point for JVM programs' },
      { concept: 'System.out.println', meaning: 'Writes characters onto the active screen visual' },
      { concept: 'Scanner', meaning: 'Spies on the standard console inputs to extract lines' },
      { concept: 'if (condition)', meaning: 'Forks task execution path if standard conditions matches true' }
    ],
    10: [
      { concept: 'loop', meaning: 'Drives continuous loops execution until guards evaluate false' },
      { concept: 'new', meaning: 'Deploys reference structures and classes onto the virtual JVM heap' },
      { concept: 'array.length', meaning: 'Resolves the total container slots allocated to a raw array' },
      { concept: 'static', meaning: 'Attributes state access directly to the parent class level' },
      { concept: 'Constructor', meaning: 'Enacts specialized startup logic immediately when creating objects' }
    ],
    15: [
      { concept: 'extends', meaning: 'Hooks a child layer template to adopt its master parent logic' },
      { concept: 'Polymorphism', meaning: 'Supports dynamic runtime bindings where child mimics parent' },
      { concept: 'finally', meaning: 'Runs cleanups definitely after try catch statements conclude' },
      { concept: 'ArrayList', meaning: 'Dynamic custom storage vector class from utilities package' },
      { concept: 'get(index)', meaning: 'Pulls the individual item located at a target array list slot' }
    ]
  },
  cpp: {
    5: [
      { concept: 'bool', meaning: 'Controls state flags showing standard true or false signals' },
      { concept: 'std::cout', meaning: 'Directs messages towards standard console output flows' },
      { concept: '<< operator', meaning: 'Pushes characters or values into standard target streams' },
      { concept: 'std::cin', meaning: 'Reads lines typed on the terminal keyboard index variables' },
      { concept: 'Index offset', meaning: 'Begins tracking elements starting from index slot 0' }
    ],
    10: [
      { concept: 'Overloading', meaning: 'Declares multiple tasks with identical names but differing inputs' },
      { concept: 'public', meaning: 'Exposes private class attributes to outside calling commands' },
      { concept: 'child : parent', meaning: 'Establishes direct derivation relationships in C++ structures' },
      { concept: 'push_back()', meaning: 'Appends a new value directly to the tail of dynamic vectors' },
      { concept: 'ofstream', meaning: 'C++ class pipeline used to dump text content directly to disk files' }
    ]
  },
  javascript: {
    5: [
      { concept: 'let', meaning: 'Defines block-level scoped variables that allow reassignment' },
      { concept: 'const', meaning: 'Declares unmodifiable static references that cannot be rebound' },
      { concept: '===', meaning: 'Checks precise equality of both variable value and datatype' },
      { concept: 'Boolean', meaning: 'Represents simple true or false logic assessments' },
      { concept: 'Arrow Function', meaning: 'Provides modern compact handles to represent callbacks' }
    ],
    10: [
      { concept: 'Array', meaning: 'Represents ordered sequencings of multiple element blocks' },
      { concept: 'push()', meaning: 'Appends elements to the terminating end of arrays' },
      { concept: 'Object', meaning: 'Encloses direct property attribute key-to-value matches' },
      { concept: 'getElementById()', meaning: 'Queries the HTML DOM layout to select a targeted card node' },
      { concept: 'localStorage', meaning: 'Stores string key-value values permanently inside internet browsers' }
    ]
  }
};

const rawCourses = [
  pythonCourse,
  cCourse,
  javascriptCourse,
  javaCourse,
  cppCourse
];

// Dynamically generate levels list with matching milestone milestones after every 5 complete levels
export const courses = rawCourses.map(course => {
  const newLevels = [];
  let seqId = 1;
  const milestonesForCourse = COURSE_MILESTONES[course.id] || {};
  
  course.levels.forEach((lvl, idx) => {
    // Add raw level
    newLevels.push({
      ...lvl,
      id: seqId++,
      originalId: lvl.id,
      isMatchingMilestone: false
    });
    
    // Insert milestone after every 5 complete levels
    const learningCount = idx + 1;
    if (learningCount % 5 === 0) {
      const pairs = milestonesForCourse[learningCount];
      if (pairs) {
        newLevels.push({
          id: seqId++,
          originalId: null,
          title: "Concept Matcher",
          isMatchingMilestone: true,
          pairs: pairs,
          story: "Splendid work! You have completed another set of 5 core learning topics. Let's practice a fast retrieval milestone to cement these concepts in your memory.",
          analogy: "Recall is the key to deep learning. Connect each element on the left with its definition on the right to complete this milestone!",
          code: "// Milestone Concept Revision\n// Link each concept to its meaning to advance!",
          altCode: "",
          question: "Connect each concept on the left with its correct meaning on the right.",
          options: [],
          answerIndex: 0
        });
      }
    }
  });

  return {
    ...course,
    levels: newLevels
  };
});

// Helper to look up level data
export function getCourseData(courseId) {
  return courses.find(c => c.id === courseId);
}

export function getLevelData(courseId, levelId) {
  const course = getCourseData(courseId);
  if (!course) return null;
  const targetId = parseInt(levelId, 10);
  return course.levels.find(l => l.id === targetId);
}
