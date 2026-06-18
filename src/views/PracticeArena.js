import { getCurrentUser, saveUser, awardSkillSparks, awardLogicKeys } from '../auth.js';
import confetti from 'canvas-confetti';

const PRACTICE_PUZZLES = [
  {
    id: 1,
    arenaId: "basic",
    title: "Python: Variables & Printing",
    description: "Write a short Python code fragment that declares fruit counts, sums them into a total, and displays the sum.",
    shuffled: [
      { text: 'apples = 5', index: 0 },
      { text: 'peaches = 3', index: 1 },
      { text: 'total_fruits = apples + peaches', index: 2 },
      { text: 'print(total_fruits)', index: 3 }
    ],
    correctOrder: [
      'apples = 5',
      'peaches = 3',
      'total_fruits = apples + peaches',
      'print(total_fruits)'
    ],
    hint: "Constants apples and peaches must be set before we add them up into our total. The print call comes last!"
  },
  {
    id: 2,
    arenaId: "loops",
    title: "Python: Loops & Counters",
    description: "Construct a while loop that decreases a variable 'count' from 3 down to 1 while printing along the way.",
    shuffled: [
      { text: 'count = 3', index: 0 },
      { text: 'while count > 0:', index: 1 },
      { text: '    print(count)', index: 2 },
      { text: '    count -= 1', index: 3 }
    ],
    correctOrder: [
      'count = 3',
      'while count > 0:',
      '    print(count)',
      '    count -= 1'
    ],
    hint: "Set count equal to 3 first. Establish the while boundary loop structure before executing operations or decreasing inside its block."
  },
  {
    id: 3,
    arenaId: "basic",
    title: "C Language: Hello World structure",
    description: "Organize a standard C program that pulls helper standard libraries and executes main prints.",
    shuffled: [
      { text: '#include <stdio.h>', index: 0 },
      { text: 'int main() {', index: 1 },
      { text: '    printf("Hello C Developer!\\n");', index: 2 },
      { text: '    return 0;', index: 3 },
      { text: '}', index: 4 }
    ],
    correctOrder: [
      '#include <stdio.h>',
      'int main() {',
      '    printf("Hello C Developer!\\n");',
      '    return 0;',
      '}'
    ],
    hint: "Reference libraries using #include macros at the absolute head. Wrap operations inside main execution blocks and finish with returning 0."
  },
  {
    id: 4,
    arenaId: "objects",
    title: "Java: Class Blueprint Launcher",
    description: "Construct a minimal, executable Java class with a primary launcher public method.",
    shuffled: [
      { text: 'public class Launcher {', index: 0 },
      { text: '    public static void main(String[] args) {', index: 1 },
      { text: '        System.out.println("Java Ready!");', index: 2 },
      { text: '    }', index: 3 },
      { text: '}', index: 4 }
    ],
    correctOrder: [
      'public class Launcher {',
      '    public static void main(String[] args) {',
      '        System.out.println("Java Ready!");',
      '    }',
      '}'
    ],
    hint: "Establish the class wrapper interface before defining its static class launcher method. Enclose codes in correct brackets."
  },
  {
    id: 5,
    arenaId: "basic",
    title: "JavaScript: DOM Event Listener",
    description: "Write a standard JavaScript syntax to select a webpage button element and attach a trigger listener.",
    shuffled: [
      { text: 'const button = document.getElementById("action-btn");', index: 0 },
      { text: 'button.addEventListener("click", () => {', index: 1 },
      { text: '    console.log("Button clicked!");', index: 2 },
      { text: '});', index: 3 }
    ],
    correctOrder: [
      'const button = document.getElementById("action-btn");',
      'button.addEventListener("click", () => {',
      '    console.log("Button clicked!");',
      '});'
    ],
    hint: "Query the DOM structure using getElementById before applying dynamic interactive event listeners onto the reference element."
  },
  {
    id: 6,
    arenaId: "functions",
    title: "C++: Addition Functions",
    description: "Build a generic C++ function that sums two integers and returns the total.",
    shuffled: [
      { text: 'int sum(int x, int y) {', index: 0 },
      { text: '    return x + y;', index: 1 },
      { text: '}', index: 2 },
      { text: 'int main() {', index: 3 },
      { text: '    std::cout << sum(10, 20);', index: 4 },
      { text: '}', index: 5 }
    ],
    correctOrder: [
      'int sum(int x, int y) {',
      '    return x + y;',
      '}',
      'int main() {',
      '    std::cout << sum(10, 20);',
      '}'
    ],
    hint: "Declare helper arithmetic routines above main execution so C++ compilers can resolve targets before calls occur."
  },
  {
    id: 7,
    arenaId: "loops",
    title: "Python: Even or Odd Checker",
    description: "Write code that checks if a value 'num' is even, printing 'Even', else printing 'Odd'.",
    shuffled: [
      { text: 'num = 7', index: 0 },
      { text: 'if num % 2 == 0:', index: 1 },
      { text: '    print("Even")', index: 2 },
      { text: 'else:', index: 3 },
      { text: '    print("Odd")', index: 4 }
    ],
    correctOrder: [
      'num = 7',
      'if num % 2 == 0:',
      '    print("Even")',
      'else:',
      '    print("Odd")'
    ],
    hint: "First initialize the number 'num'. Next, establish the 'if' condition dividing num by 2 with modulo. Provide the 'else' fallback print last."
  },
  {
    id: 8,
    arenaId: "functions",
    title: "JavaScript: Double Elements",
    description: "Transform an array of numbers using the .map() method to multiply each element by two.",
    shuffled: [
      { text: 'const numbers = [1, 2, 3];', index: 0 },
      { text: 'const doubled = numbers.map(num => {', index: 1 },
      { text: '    return num * 2;', index: 2 },
      { text: '});', index: 3 },
      { text: 'console.log(doubled);', index: 4 }
    ],
    correctOrder: [
      'const numbers = [1, 2, 3];',
      'const doubled = numbers.map(num => {',
      '    return num * 2;',
      '});',
      'console.log(doubled);'
    ],
    hint: "Start by declaring the array of numbers. Then, trigger mapping transformations on that array, write the returning double logic inside, close the listener, and log the results."
  },
  {
    id: 9,
    arenaId: "loops",
    title: "C Language: Summing Array Values",
    description: "Initialize an integer array of size 3, write a loop that sums all contents, and print total sum.",
    shuffled: [
      { text: 'int arr[3] = {10, 20, 30};', index: 0 },
      { text: 'int sum = 0;', index: 1 },
      { text: 'for (int i = 0; i < 3; i++) {', index: 2 },
      { text: '    sum += arr[i];', index: 3 },
      { text: '}', index: 4 },
      { text: 'printf("Sum: %d\\n", sum);', index: 5 }
    ],
    correctOrder: [
      'int arr[3] = {10, 20, 30};',
      'int sum = 0;',
      'for (int i = 0; i < 3; i++) {',
      '    sum += arr[i];',
      '}',
      'printf("Sum: %d\\n", sum);'
    ],
    hint: "Initialize array and total sum to zero first. Loop boundaries must then fetch items indexed sequentially to accumulate, and printf prints the final sum value."
  },
  {
    id: 10,
    arenaId: "objects",
    title: "Java: User Class Constructor",
    description: "Initialize a User class configuration containing a string field 'username' and a constructor setting its state.",
    shuffled: [
      { text: 'public class User {', index: 0 },
      { text: '    private String username;', index: 1 },
      { text: '    public User(String name) {', index: 2 },
      { text: '        this.username = name;', index: 3 },
      { text: '    }', index: 4 },
      { text: '}', index: 5 }
    ],
    correctOrder: [
      'public class User {',
      '    private String username;',
      '    public User(String name) {',
      '        this.username = name;',
      '    }',
      '}'
    ],
    hint: "Establish the public class scope envelope, declare fields at class variables level, declare matching constructors, assign names, and close brackets."
  },
  {
    id: 11,
    arenaId: "objects",
    title: "C++: Member Object Blueprint",
    description: "Design a simple Car class highlighting private states and public getters.",
    shuffled: [
      { text: 'class Car {', index: 0 },
      { text: 'private:', index: 1 },
      { text: '    int speed;', index: 2 },
      { text: 'public:', index: 3 },
      { text: '    int getSpeed() { return speed; }', index: 4 },
      { text: '};', index: 5 }
    ],
    correctOrder: [
      'class Car {',
      'private:',
      '    int speed;',
      'public:',
      '    int getSpeed() { return speed; }',
      '};'
    ],
    hint: "Start with the 'class Car {' block. Mention private specifier scopes and their variables before public getters, ending class templates with standard semicolons."
  },
  {
    id: 12,
    arenaId: "basic",
    title: "Python: User Greeting Program",
    description: "Capture user name typing directly from input streams and render customized greetings.",
    shuffled: [
      { text: 'user_name = input("Enter name: ")', index: 0 },
      { text: 'greeting = f"Welcome aboard, {user_name}!"', index: 1 },
      { text: 'print(greeting)', index: 2 }
    ],
    correctOrder: [
      'user_name = input("Enter name: ")',
      'greeting = f"Welcome aboard, {user_name}!"',
      'print(greeting)'
    ],
    hint: "Begin by prompting username input before constructing custom f-strings. Execute console print checks last."
  },
  {
    id: 13,
    arenaId: "functions",
    title: "JavaScript: Filter Odds Helper",
    description: "Create standard utility lines utilizing filters that isolate element items containing odd check matches.",
    shuffled: [
      { text: 'const items = [4, 9, 11, 16];', index: 0 },
      { text: 'const odds = items.filter(num => {', index: 1 },
      { text: '    return num % 2 !== 0;', index: 2 },
      { text: '});', index: 3 },
      { text: 'console.log(odds);', index: 4 }
    ],
    correctOrder: [
      'const items = [4, 9, 11, 16];',
      'const odds = items.filter(num => {',
      '    return num % 2 !== 0;',
      '});',
      'console.log(odds);'
    ],
    hint: "Declare elements items list, invoke filtering predicates, specify odd conditions with !== 0, and close the expression gracefully before outputting results."
  },
  {
    id: 14,
    arenaId: "arrays",
    title: "C Language: Pointer Dereferencing",
    description: "Initialize an integer variable, link a pointer variable to its memory address, and modify value via reference.",
    shuffled: [
      { text: 'int score = 100;', index: 0 },
      { text: 'int *ptr = &score;', index: 1 },
      { text: '*ptr = 250;', index: 2 },
      { text: 'printf("New: %d\\n", score);', index: 3 }
    ],
    correctOrder: [
      'int score = 100;',
      'int *ptr = &score;',
      '*ptr = 250;',
      'printf("New: %d\\n", score);'
    ],
    hint: "First initialize the score. Declare the pointer assigning it to the address using '&score'. Then modify target registers with '*ptr' and confirm results with print calls."
  },
  {
    id: 15,
    arenaId: "arrays",
    title: "Java: Safe Division Try-Catch",
    description: "Construct exception handlers to gracefully rescue integer divisions by zero.",
    shuffled: [
      { text: 'try {', index: 0 },
      { text: '    int result = 50 / 0;', index: 1 },
      { text: '} catch (ArithmeticException e) {', index: 2 },
      { text: '    System.out.println("Cannot divide by zero!");', index: 3 },
      { text: '}', index: 4 }
    ],
    correctOrder: [
      'try {',
      '    int result = 50 / 0;',
      '} catch (ArithmeticException e) {',
      '    System.out.println("Cannot divide by zero!");',
      '}'
    ],
    hint: "Begin by opening a try block to enclose unstable mathematical operations. Handle ArithmeticException with catch definitions, execute rescue prints inside, and close the brace."
  },
  {
    id: 16,
    arenaId: "functions",
    title: "Go: Simple HTTP Handler",
    description: "Construct a basic web server in Go that listens on port 8080 and registers a greeting route handler func.",
    shuffled: [
      { text: 'package main', index: 0 },
      { text: 'import ("fmt"; "net/http")', index: 1 },
      { text: 'func hello(w http.ResponseWriter, r *http.Request) {', index: 2 },
      { text: '    fmt.Fprint(w, "Hello Go!")', index: 3 },
      { text: '}', index: 4 },
      { text: 'func main() {', index: 5 },
      { text: '    http.HandleFunc("/", hello)', index: 6 },
      { text: '    http.ListenAndServe(":8080", nil)', index: 7 },
      { text: '}', index: 8 }
    ],
    correctOrder: [
      'package main',
      'import ("fmt"; "net/http")',
      'func hello(w http.ResponseWriter, r *http.Request) {',
      '    fmt.Fprint(w, "Hello Go!")',
      '}',
      'func main() {',
      '    http.HandleFunc("/", hello)',
      '    http.ListenAndServe(":8080", nil)',
      '}'
    ],
    hint: "Start with Go's standard package declaration main, import library bindings, define the sub-route callback handler, then set the server port in main function blocks."
  },
  {
    id: 17,
    arenaId: "functions",
    title: "Rust: Safe Option Matching",
    description: "Extract a value from a Rust Option enum container using correct pattern matching expression arms.",
    shuffled: [
      { text: 'let username: Option<String> = Some("Alice".to_string());', index: 0 },
      { text: 'match username {', index: 1 },
      { text: '    Some(name) => println!("User: {}", name),', index: 2 },
      { text: '    None => println!("Anonymous"),', index: 3 },
      { text: '}', index: 4 }
    ],
    correctOrder: [
      'let username: Option<String> = Some("Alice".to_string());',
      'match username {',
      '    Some(name) => println!("User: {}", name),',
      '    None => println!("Anonymous"),',
      '}'
    ],
    hint: "Instantiate your Option wrapping string expression first, then perform structural match, covering both Some(value) and None exhaustively."
  },
  {
    id: 18,
    arenaId: "objects",
    title: "TypeScript: Interface Definition",
    description: "Declare a strict TypeScript interface with readonly modifier properties and optional fields.",
    shuffled: [
      { text: 'interface WebUser {', index: 0 },
      { text: '    readonly id: number;', index: 1 },
      { text: '    email: string;', index: 2 },
      { text: '    nickname?: string;', index: 3 },
      { text: '}', index: 4 }
    ],
    correctOrder: [
      'interface WebUser {',
      '    readonly id: number;',
      '    email: string;',
      '    nickname?: string;',
      '}'
    ],
    hint: "Begin using the interface declaration block. Outline readonly fields at the top, standard fields in the middle, and nullable properties with optional question marks last."
  },
  {
    id: 19,
    arenaId: "arrays",
    title: "SQL: Aggregating Department Salaries",
    description: "Develop a standard SQL search query to extract the total salary of each department filtering out low budgets.",
    shuffled: [
      { text: 'SELECT department_id, SUM(salary)', index: 0 },
      { text: 'FROM employees', index: 1 },
      { text: "WHERE hire_date > '2023-01-01'", index: 2 },
      { text: 'GROUP BY department_id', index: 3 },
      { text: 'HAVING SUM(salary) > 50000;', index: 4 }
    ],
    correctOrder: [
      'SELECT department_id, SUM(salary)',
      'FROM employees',
      "WHERE hire_date > '2023-01-01'",
      'GROUP BY department_id',
      'HAVING SUM(salary) > 50000;'
    ],
    hint: "Draft column identifiers selects first, specify source relational tables, write conditions with WHERE clause, apply GROUP BY to group outputs, and restrict rows with HAVING expressions."
  },
  {
    id: 20,
    arenaId: "objects",
    title: "Swift: Struct with Computed Attribute",
    description: "Create a Swift Rectangle structure that calculates its computed area property dynamically.",
    shuffled: [
      { text: 'struct Rectangle {', index: 0 },
      { text: '    var width: Double', index: 1 },
      { text: '    var height: Double', index: 2 },
      { text: '    var area: Double {', index: 3 },
      { text: '        return width * height', index: 4 },
      { text: '    }', index: 5 },
      { text: '}', index: 6 }
    ],
    correctOrder: [
      'struct Rectangle {',
      '    var width: Double',
      '    var height: Double',
      '    var area: Double {',
      '        return width * height',
      '    }',
      '}'
    ],
    hint: "Use struct definitions first. Lay out base stored properties width/height before declaring nested computed structures calculating multiplication return outcomes."
  },
  {
    id: 21,
    arenaId: "loops",
    title: "Ruby: Array Blocks Iterator",
    description: "Iterate through a Ruby string array using each blocks and print capitalized words smoothly.",
    shuffled: [
      { text: 'words = ["code", "logic", "syntax"]', index: 0 },
      { text: 'words.each do |w|', index: 1 },
      { text: '    puts w.capitalize', index: 2 },
      { text: 'end', index: 3 }
    ],
    correctOrder: [
      'words = ["code", "logic", "syntax"]',
      'words.each do |w|',
      '    puts w.capitalize',
      'end'
    ],
    hint: "Generate custom string collection arrays. Call the .each iterator using pipeline parameter boundaries block, output processing prints, and end structure."
  },
  {
    id: 22,
    arenaId: "arrays",
    title: "PHP: Key-Value Map Iteration",
    description: "Declare an associative key-value array database in PHP and loop over entries mapping keys and values.",
    shuffled: [
      { text: '$capitals = ["US" => "DC", "FR" => "Paris"];', index: 0 },
      { text: 'foreach ($capitals as $country => $city) {', index: 1 },
      { text: '    echo "The capital of {$country} is {$city}\\n";', index: 2 },
      { text: '}', index: 3 }
    ],
    correctOrder: [
      '$capitals = ["US" => "DC", "FR" => "Paris"];',
      'foreach ($capitals as $country => $city) {',
      '    echo "The capital of {$country} is {$city}\\n";',
      '}'
    ],
    hint: "Instantiate associative array maps using => operators. Setup PHP foreach construct syntax unpacking key/value records, output strings, and close brackets."
  },
  {
    id: 23,
    arenaId: "arrays",
    title: "Python: List Comprehension Filter",
    description: "Leverage Python single-line list comprehension expressions to filter and square all even numbers.",
    shuffled: [
      { text: 'raw_data = [1, 2, 3, 4, 5, 6]', index: 0 },
      { text: 'squares = [n ** 2 for n in raw_data if n % 2 == 0]', index: 1 },
      { text: 'print(squares)', index: 2 }
    ],
    correctOrder: [
      'raw_data = [1, 2, 3, 4, 5, 6]',
      'squares = [n ** 2 for n in raw_data if n % 2 == 0]',
      'print(squares)'
    ],
    hint: "Establish input datasets arrays first. Assemble the inline list builder targeting exponent calculation, iterator variables loop, conditional filters, then outputs print."
  },
  {
    id: 24,
    arenaId: "functions",
    title: "JavaScript: Promises Async Await",
    description: "Fetch API resources asynchronously in JS using standard modern async/await routines with try-catch safety.",
    shuffled: [
      { text: 'async function loadData() {', index: 0 },
      { text: '    try {', index: 1 },
      { text: '        const res = await fetch("/api/data");', index: 2 },
      { text: '        const body = await res.json();', index: 3 },
      { text: '        return body;', index: 4 },
      { text: '    } catch (err) {', index: 5 },
      { text: '        console.error("Fetch failed", err);', index: 6 },
      { text: '    }', index: 7 },
      { text: '}', index: 8 }
    ],
    correctOrder: [
      'async function loadData() {',
      '    try {',
      '        const res = await fetch("/api/data");',
      '        const body = await res.json();',
      '        return body;',
      '    } catch (err) {',
      '        console.error("Fetch failed", err);',
      '    }',
      '}'
    ],
    hint: "Structure the async function header, start an error-safe try block before executing awaits calls to retrieve and parse responses, return the parsed body, and handle alternate exceptions with catch handlers."
  },
  {
    id: 25,
    arenaId: "loops",
    title: "Bash: File Line Reader Loop",
    description: "Write a standard Unix Shell Bash loop script block that reads lines from secure config files sequentially.",
    shuffled: [
      { text: 'FILE_NAME="settings.conf"', index: 0 },
      { text: 'while IFS= read -r line; do', index: 1 },
      { text: '    echo "Processing line: $line"', index: 2 },
      { text: 'done < "$FILE_NAME"', index: 3 }
    ],
    correctOrder: [
      'FILE_NAME="settings.conf"',
      'while IFS= read -r line; do',
      '    echo "Processing line: $line"',
      'done < "$FILE_NAME"'
    ],
    hint: "Initiate variables referencing files first. Launch your IFS read buffer while block printing parameters, and feed output redirect pointer targets from bottom handles."
  },
  {
    id: 26,
    arenaId: "basic",
    title: "Kotlin: Null-Safe Elvis Operator",
    description: "Enforce safe null boundary fallbacks in Kotlin using nullable variable types and Elvis operator checks.",
    shuffled: [
      { text: 'val nickname: String? = null', index: 0 },
      { text: 'val displayName: String = nickname ?: "Guest"', index: 1 },
      { text: 'println("Hello $displayName")', index: 2 }
    ],
    correctOrder: [
      'val nickname: String? = null',
      'val displayName: String = nickname ?: "Guest"',
      'println("Hello $displayName")'
    ],
    hint: "Set up nullable parameters carrying optional question marks initial values. Apply safe Elvis operators ?: fallback values assigns, then execute output operations last."
  },
  {
    id: 27,
    arenaId: "arrays",
    title: "C++: Dynamic Vector Insert",
    description: "Construct an empty elements vector in C++, perform pushes, and output size metrics cleanly.",
    shuffled: [
      { text: '#include <vector>', index: 0 },
      { text: 'std::vector<int> numbers;', index: 1 },
      { text: 'numbers.push_back(10);', index: 2 },
      { text: 'numbers.push_back(20);', index: 3 },
      { text: 'std::cout << numbers.size();', index: 4 }
    ],
    correctOrder: [
      '#include <vector>',
      'std::vector<int> numbers;',
      'numbers.push_back(10);',
      'numbers.push_back(20);',
      'std::cout << numbers.size();'
    ],
    hint: "Include vectors template definitions, declare the vector instance, trigger push_back calls on elements arrays, and dispatch outputs sequentially."
  },
  {
    id: 28,
    arenaId: "basic",
    title: "HTML5: Structuring Data Tables",
    description: "Compose structural elements arranging semantic HTML data tables with headers and matching tables row entries.",
    shuffled: [
      { text: '<table>', index: 0 },
      { text: '  <tr>', index: 1 },
      { text: '    <th>Skill</th>', index: 2 },
      { text: '    <td>C++</td>', index: 3 },
      { text: '  </tr>', index: 4 },
      { text: '</table>', index: 5 }
    ],
    correctOrder: [
      '<table>',
      '  <tr>',
      '    <th>Skill</th>',
      '    <td>C++</td>',
      '  </tr>',
      '</table>'
    ],
    hint: "Wrap semantic tables using table block boundaries, initiate main table rows tr components with internal th and td data registers correctly nested."
  },
  {
    id: 29,
    arenaId: "basic",
    title: "CSS: Perfect Viewport Centering",
    description: "Define styles using basic layout directives achieving visual layouts inside browsers containers.",
    shuffled: [
      { text: '.container {', index: 0 },
      { text: '  display: flex;', index: 1 },
      { text: '  justify-content: center;', index: 2 },
      { text: '  align-items: center;', index: 3 },
      { text: '  height: 100vh;', index: 4 },
      { text: '}', index: 5 }
    ],
    correctOrder: [
      '.container {',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '  height: 100vh;',
      '}'
    ],
    hint: "Establish target wrapper layout classes rules. Declare modern flex styles maps centering across axes, scale bounds to full viewport 100vh, then close."
  },
  {
    id: 30,
    arenaId: "objects",
    title: "Java: Concurrent Thread Spawn",
    description: "Execute asynchronous threads inside Java applications combining functional interfaces and instance launch actions.",
    shuffled: [
      { text: 'Thread worker = new Thread(() -> {', index: 0 },
      { text: '    System.out.println("Async thread active!");', index: 1 },
      { text: '});', index: 2 },
      { text: 'worker.start();', index: 3 }
    ],
    correctOrder: [
      'Thread worker = new Thread(() -> {',
      '    System.out.println("Async thread active!");',
      '});',
      'worker.start();'
    ],
    hint: "Initialize your raw Java Thread instances feeding concurrent logic instructions lambdas envelopes, then trigger execution with start methods."
  },
  {
    id: 31,
    arenaId: "objects",
    title: "Rust: Safe Impl Blocks Structs",
    description: "Design typed configurations in Rust dividing custom structures layout schemas and object methods implementation boundaries.",
    shuffled: [
      { text: 'struct User { name: String }', index: 0 },
      { text: 'impl User {', index: 1 },
      { text: '    fn new(n: &str) -> Self {', index: 2 },
      { text: '        User { name: n.to_string() }', index: 3 },
      { text: '    }', index: 4 },
      { text: '}', index: 5 }
    ],
    correctOrder: [
      'struct User { name: String }',
      'impl User {',
      '    fn new(n: &str) -> Self {',
      '        User { name: n.to_string() }',
      '    }',
      '}'
    ],
    hint: "Write struct schemas declaration scopes beforehand, activate dedicated impl methods containers implementing custom instantiation builders returning Safe profiles."
  },
  {
    id: 32,
    arenaId: "objects",
    title: "Scala: Sealed Trait Case Match",
    description: "Develop sealed hierarchy objects compiling matched case structures with variables mapping.",
    shuffled: [
      { text: 'sealed trait Task', index: 0 },
      { text: 'case class Bug(fix: String) extends Task', index: 1 },
      { text: 'val action: Task = Bug("Memory leak")', index: 2 },
      { text: 'action match {', index: 3 },
      { text: '  case Bug(f) => println(s"Fixing: $f")', index: 4 },
      { text: '}', index: 5 }
    ],
    correctOrder: [
      'sealed trait Task',
      'case class Bug(fix: String) extends Task',
      'val action: Task = Bug("Memory leak")',
      'action match {',
      '  case Bug(f) => println(s"Fixing: $f")',
      '}'
    ],
    hint: "Describe traits, derive subclass case models structures, allocate memory variable items containing instances, and run dynamic type matches."
  },
  {
    id: 33,
    arenaId: "functions",
    title: "Go: Channel Communications",
    description: "Enable concurrency pathways with messages transmission across decoupled channels queues.",
    shuffled: [
      { text: 'messages := make(chan string)', index: 0 },
      { text: 'go func() {', index: 1 },
      { text: '    messages <- "ping"', index: 2 },
      { text: '}()', index: 3 },
      { text: 'msg := <-messages', index: 4 },
      { text: 'fmt.Println(msg)', index: 5 }
    ],
    correctOrder: [
      'messages := make(chan string)',
      'go func() {',
      '    messages <- "ping"',
      '}()',
      'msg := <-messages',
      'fmt.Println(msg)'
    ],
    hint: "Establish target string pipelines with make structures, run asynchronous goroutines dispatching entries, resolve messages inputs, and print log lines."
  },
  {
    id: 34,
    arenaId: "functions",
    title: "TypeScript: Generics Constraints",
    description: "Write static generic methods assuring parameter attributes contain exact matching interfaces properties.",
    shuffled: [
      { text: 'function logLength<T extends { length: number }>(arg: T): void {', index: 0 },
      { text: '    console.log(arg.length);', index: 1 },
      { text: '}', index: 2 }
    ],
    correctOrder: [
      'function logLength<T extends { length: number }>(arg: T): void {',
      '    console.log(arg.length);',
      '}'
    ],
    hint: "Introduce templates structures specifying interface guarantees beforehand with extends expressions, process inner attributes values correctly, and close braces."
  },
  {
    id: 35,
    arenaId: "functions",
    title: "Python: Decorator Middlewares",
    description: "Compose custom high order wrappers tracking or injecting statements into separate logic execution loops.",
    shuffled: [
      { text: 'def log_call(func):', index: 0 },
      { text: '    def wrapper(*args, **kwargs):', index: 1 },
      { text: '        print("Invoking function")', index: 2 },
      { text: '        return func(*args, **kwargs)', index: 3 },
      { text: '    return wrapper', index: 4 }
    ],
    correctOrder: [
      'def log_call(func):',
      '    def wrapper(*args, **kwargs):',
      '        print("Invoking function")',
      '        return func(*args, **kwargs)',
      '    return wrapper'
    ],
    hint: "Organize parent decorators headers acquiring target functions arguments, map nested runtime arguments inside high-order wrapper boundaries, return callbacks outcomes, and export wrapper instances."
  },
  {
    id: 36,
    arenaId: "functions",
    title: "Python: Lambda Multiplication",
    description: "Create a lambda definition that takes two numerical arguments and returns their product.",
    shuffled: [
      { text: 'multiply = lambda x, y: x * y', index: 0 },
      { text: 'result = multiply(4, 5)', index: 1 },
      { text: 'print(result)', index: 2 }
    ],
    correctOrder: [
      'multiply = lambda x, y: x * y',
      'result = multiply(4, 5)',
      'print(result)'
    ],
    hint: "Assign the custom lambda expression to a variable before invoking it with numeric values and outputting the result."
  },
  {
    id: 37,
    arenaId: "arrays",
    title: "C Language: Array Element Swap",
    description: "Draft a C statement code block to swap the first and second indices of an integer array.",
    shuffled: [
      { text: 'int temp = numbers[0];', index: 0 },
      { text: 'numbers[0] = numbers[1];', index: 1 },
      { text: 'numbers[1] = temp;', index: 2 }
    ],
    correctOrder: [
      'int temp = numbers[0];',
      'numbers[0] = numbers[1];',
      'numbers[1] = temp;'
    ],
    hint: "Use an intermediate temporary variable to hold the index 0 value, overwrite index 0 with index 1, and write the temp value to index 1."
  },
  {
    id: 38,
    arenaId: "loops",
    title: "Java: Enhanced For-Loop Sum",
    description: "Formulate an enhanced for-loop in Java that iterates over a list of prices and sums them.",
    shuffled: [
      { text: 'double total = 0.0;', index: 0 },
      { text: 'for (double price : prices) {', index: 1 },
      { text: '    total += price;', index: 2 },
      { text: '}', index: 3 }
    ],
    correctOrder: [
      'double total = 0.0;',
      'for (double price : prices) {',
      '    total += price;',
      '}'
    ],
    hint: "Declare the tracking variable total first, set up the for-each sequence, accumulate within the loop block, and close the block."
  },
  {
    id: 39,
    arenaId: "basic",
    title: "C++: Input stream read",
    description: "Read an integer value from standard input (cin) and stream it straight to standard output with cout.",
    shuffled: [
      { text: 'int val;', index: 0 },
      { text: 'std::cin >> val;', index: 1 },
      { text: 'std::cout << val << std::endl;', index: 2 }
    ],
    correctOrder: [
      'int val;',
      'std::cin >> val;',
      'std::cout << val << std::endl;'
    ],
    hint: "Allocate a variable storage location first, stream standard input into it using extraction operators, then stream to standard output."
  },
  {
    id: 40,
    arenaId: "objects",
    title: "JavaScript: Object Constructor Function",
    description: "Design a classic JS constructor function that sets a member name and a greet method handler.",
    shuffled: [
      { text: 'function Coder(name) {', index: 0 },
      { text: '    this.name = name;', index: 1 },
      { text: '    this.greet = function() { return "Hi " + this.name; };', index: 2 },
      { text: '}', index: 3 }
    ],
    correctOrder: [
      'function Coder(name) {',
      '    this.name = name;',
      '    this.greet = function() { return "Hi " + this.name; };',
      '}'
    ],
    hint: "Open the constructor function definition, bind name to the this scope, assign the greet member function, and close the body brackets."
  },
  {
    id: 41,
    arenaId: "objects",
    title: "Python: Simple Inheritance Setup",
    description: "Configure a Python class named 'Developer' that inherits from a master 'User' class.",
    shuffled: [
      { text: 'class User: pass', index: 0 },
      { text: 'class Developer(User):', index: 1 },
      { text: '    def __init__(self, role):', index: 2 },
      { text: '        self.role = role', index: 3 }
    ],
    correctOrder: [
      'class User: pass',
      'class Developer(User):',
      '    def __init__(self, role):',
      '        self.role = role'
    ],
    hint: "Define the parent class User first, specify inheritance by wrapping User inside Developer parenthetical arguments, and initialize the sub-instance."
  },
  {
    id: 42,
    arenaId: "functions",
    title: "C Language: Pointer Value Update",
    description: "Draft a C function that modifies an outside integer value directly through its reference pointer.",
    shuffled: [
      { text: 'void update(int *ptr) {', index: 0 },
      { text: '*ptr = 100;', index: 1 },
      { text: '}', index: 2 }
    ],
    correctOrder: [
      'void update(int *ptr) {',
      '    *ptr = 100;',
      '}'
    ],
    hint: "Declare the update function accepting an integer pointer, dereference the pointer using the star symbol to assign its value, and close the function."
  },
  {
    id: 43,
    arenaId: "arrays",
    title: "Java: Integer Array Initializer",
    description: "Create a Java statement to declare and instantly initialize a multidimensional matrix array of integers.",
    shuffled: [
      { text: 'int[][] matrix = {', index: 0 },
      { text: '    {1, 2},', index: 1 },
      { text: '    {3, 4}', index: 2 },
      { text: '};', index: 3 }
    ],
    correctOrder: [
      'int[][] matrix = {',
      '    {1, 2},',
      '    {3, 4}',
      '};'
    ],
    hint: "Begin with the multidimensional array type declaration, utilize nested bracket constructs for matrix row values, and terminate with a semicolon."
  },
  {
    id: 44,
    arenaId: "loops",
    title: "C++: Range-Based Vector Loop",
    description: "Write a range-based loop iterating over constant vector elements in C++ to double and print nested counts.",
    shuffled: [
      { text: 'for (const auto& item : items) {', index: 0 },
      { text: '    std::cout << item * 2 << " ";', index: 1 },
      { text: '}', index: 2 }
    ],
    correctOrder: [
      'for (const auto& item : items) {',
      '    std::cout << item * 2 << " ";',
      '}'
    ],
    hint: "Use range-based for syntax referencing constant auto reference elements to read items safely without extra allocation, printing within braces."
  },
  {
    id: 45,
    arenaId: "functions",
    title: "JavaScript: Array Mapping Inline",
    description: "Write code to double every numerical element in an array using JavaScript's map function.",
    shuffled: [
      { text: 'const nums = [1, 2, 3];', index: 0 },
      { text: 'const doubled = nums.map(x => x * 2);', index: 1 },
      { text: 'console.log(doubled);', index: 2 }
    ],
    correctOrder: [
      'const nums = [1, 2, 3];',
      'const doubled = nums.map(x => x * 2);',
      'console.log(doubled);'
    ],
    hint: "Store the initial number array, call maps on it feeding a pure inline callback function, then write outputs."
  }
];

const ARENAS = [
  { id: 'basic', name: 'Basic Arena', cost: 0, description: 'Core variables, simple prints, program entry structures.' },
  { id: 'loops', name: 'Loops Arena', cost: 2, description: 'While/for logic sequences and conditional branching.' },
  { id: 'functions', name: 'Functions Arena', cost: 4, description: 'Declaration parameters, reusable logic subroutines, return vectors.' },
  { id: 'arrays', name: 'Arrays & Strings Arena', cost: 5, description: 'Order index tracking, collection transformations, pointer dereferencing.' },
  { id: 'objects', name: 'Classes & Objects Arena', cost: 6, description: 'Member blueprints, encapsulation scopes, try-catch safety handlers.' }
];

function detectLanguage(title) {
  const t = title.toLowerCase();
  if (t.includes('python')) return 'Python';
  if (t.includes('javascript') || t.includes('typescript') || t.includes('js:')) return 'JS';
  if (t.includes('java')) return 'Java';
  if (t.includes('c++')) return 'C++';
  if (t.includes('c language')) return 'C';
  return null;
}

const SUPPORTED_PRACTICE_PUZZLES = PRACTICE_PUZZLES.filter(p => detectLanguage(p.title) !== null);
const availableLanguages = ['All', 'Python', 'Java', 'C', 'C++', 'JS'];

let activePuzzleId = 1;
let currentShuffledLines = [];

export function renderPracticeArena() {
  const user = getCurrentUser();
  if (!user) return '';

  user.practiceArenaCompleted = user.practiceArenaCompleted || [];
  user.unlockedPracticeArenas = user.unlockedPracticeArenas || ['basic'];
  user.unlockedPracticeHints = user.unlockedPracticeHints || [];
  user.unlockedSyntaxVision = user.unlockedSyntaxVision || [];

  const puzzle = SUPPORTED_PRACTICE_PUZZLES.find(p => p.id === activePuzzleId) || SUPPORTED_PRACTICE_PUZZLES[0];

  // Helper session attempts tracking
  window.practiceAttempts = window.practiceAttempts || {};
  if (window.practiceAttempts[puzzle.id] === undefined) {
    window.practiceAttempts[puzzle.id] = 0;
  }

  // Handle Shuffled state initialization
  if (!currentShuffledLines || currentShuffledLines.length === 0 || window.lastInitializedPuzzleId !== activePuzzleId) {
    const originalLines = [...puzzle.shuffled];
    const shuffledArr = [...originalLines];
    for (let i = shuffledArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
    }
    
    // Double guard order check
    if (JSON.stringify(shuffledArr.map(s => s.text)) === JSON.stringify(puzzle.correctOrder)) {
      const temp = shuffledArr[0];
      shuffledArr[0] = shuffledArr[1];
      shuffledArr[1] = temp;
    }
    
    currentShuffledLines = shuffledArr.map(s => s.text);
    window.lastInitializedPuzzleId = activePuzzleId;
    window.practiceAttempts[puzzle.id] = 0;
  }

  const isArenaUnlocked = user.unlockedPracticeArenas.includes(puzzle.arenaId);
  const isPuzzleCompleted = user.practiceArenaCompleted.includes(puzzle.id);
  const isSyntaxVisionActive = isPuzzleCompleted || user.unlockedSyntaxVision.includes(puzzle.id);
  const isHintActive = isPuzzleCompleted || user.unlockedPracticeHints.includes(puzzle.id) || puzzle.arenaId === 'basic';

  let workspaceHtml = '';

  if (!isArenaUnlocked) {
    const activeArena = ARENAS.find(a => a.id === puzzle.arenaId) || ARENAS[0];
    workspaceHtml = `
      <div class="glass-panel" style="padding: 3rem 2rem; display: flex; flex-direction: column; gap: 1.5rem; justify-content: center; align-items: center; text-align: center; box-sizing: border-box; border-color: rgba(176, 38, 255, 0.3);">
        <div style="font-size: 3rem; margin-bottom: 0.5rem; animation: pulse 2s infinite;">🗝️</div>
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; background: rgba(176, 38, 255, 0.1); border: 1px solid var(--purple); border-radius: 12px; padding: 4px 12px; color: var(--purple); letter-spacing: 1px;">
            Locked Advanced Arena
          </span>
          <h2 class="text-gradient" style="margin: 15px 0 8px 0; font-size: 1.8rem; font-weight: 800;">${activeArena.name}</h2>
          <p style="margin: 0 auto; color: var(--text-muted); font-size: 1rem; max-width: 500px; line-height: 1.6;">
            ${activeArena.description}
          </p>
        </div>
        
        <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--element-border); padding: 15px 25px; border-radius: 8px; margin: 10px 0; max-width: 400px; width: 100%;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-bottom: 5px;">Unlocking Cost</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--cyan); text-shadow: 0 0 10px var(--cyan-glow);">${activeArena.cost} Logic Keys 🗝️</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px;">Your Balance: ${user.logicKeys || 0} 🗝️ Keys</div>
        </div>

        <div>
          ${(user.logicKeys || 0) >= activeArena.cost ? `
            <button id="unlock-arena-submit-btn" class="btn-neon" data-arena-id="${activeArena.id}" data-cost="${activeArena.cost}"
                    style="padding: 12px 30px; font-weight: bold; font-size: 1rem; border-color: var(--cyan); color: var(--text-main); background: transparent; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
              Unlock Arena (Spend ${activeArena.cost} 🗝️)
            </button>
          ` : `
            <button class="btn-neon" style="padding: 12px 30px; font-weight: bold; font-size: 1rem; border-color: var(--element-border); color: var(--text-muted); background: rgba(0,0,0,0.4); cursor: not-allowed;" disabled>
              Need ${activeArena.cost} Logic Keys (Short by ${activeArena.cost - (user.logicKeys || 0)} 🗝️)
            </button>
            <p style="font-size: 0.8rem; color: var(--purple); margin-top: 8px; font-weight: 500;">Practice Free Basic Arena puzzles first to earn Logic Keys!</p>
          `}
        </div>
      </div>
    `;
  } else {
    // Render standard interactive workspace with replay options, vision, and hint structures
    workspaceHtml = `
      <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; justify-content: space-between; box-sizing: border-box;">
        
        <!-- Replay indicator block -->
        ${isPuzzleCompleted ? `
          <div style="padding: 12px 15px; border-radius: 8px; background: rgba(176, 38, 255, 0.08); border: 1.5px solid var(--purple); font-size: 0.88rem; color: var(--text-main); font-weight: 500; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <span style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--purple); font-weight: bold;">✓ Solved Puzzle</span> 
              <span>Replayed completions award +1 Spark to revision review!</span>
            </span>
            <button id="restart-puzzle-btn" class="btn-neon" style="padding: 4px 10px; font-size: 0.72rem; border-color: var(--purple); color: var(--text-main); font-weight: bold; background: transparent; cursor: pointer;">
              🔄 Practice Again
            </button>
          </div>
        ` : ''}

        <!-- Selected Puzzle details -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--element-border); padding-bottom: 10px; margin-bottom: 15px; flex-wrap: wrap; gap: 12px;">
            <h2 style="margin: 0; font-size: 1.4rem; color: var(--text-main); font-weight: bold; font-family: inherit;">${puzzle.title}</h2>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; background: rgba(0, 243, 255, 0.1); border: 1px solid var(--cyan); border-radius: 12px; padding: 4px 10px; color: var(--cyan); letter-spacing: 0.5px;">
                Interactive Puzzle
              </span>
            </div>
          </div>
          <p style="margin: 0; color: var(--text-main); font-size: 1.05rem; line-height: 1.5; font-family: inherit; font-weight: 500;">
            ${puzzle.description}
          </p>
        </div>

        <!-- Lines items arrangers lists -->
        <div style="background: rgba(0,0,0,0.25); border-radius: 8px; padding: 15px; border: 1px solid var(--element-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px dashed var(--element-border); padding-bottom: 8px; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 0.8rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px;">
              Syntax Block Construction
            </div>
            
            <!-- Syntax Vision button trigger -->
            <div id="syntax-vision-container">
              ${isSyntaxVisionActive ? `
                <span style="font-size: 0.78rem; color: var(--cyan); font-weight: bold; background: rgba(0, 243, 255, 0.1); border: 1px solid var(--cyan); padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                  Syntax Vision Active
                </span>
              ` : `
                ${(user.logicKeys || 0) >= 1 ? `
                  <button id="activate-syntax-vision-btn" class="btn-neon" style="padding: 4px 10px; font-size: 0.75rem; border-color: var(--purple); color: var(--purple); font-weight: bold; background: transparent; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;" title="Highlight misplaced blocks">
                    Syntax Vision (Cost: 1 🗝️)
                  </button>
                ` : `
                  <span style="font-size: 0.72rem; color: var(--text-muted); padding: 4px 8px; border: 1px solid var(--element-border); border-radius: 6px; display: inline-block;">
                    Vision Locked (Need 1 🗝️)
                  </span>
                `}
              `}
            </div>
          </div>

          <div id="arena-items-list" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
            ${currentShuffledLines.map((line, idx) => {
              const isLineCorrect = line === puzzle.correctOrder[idx];
              
              let edgeStyle = 'border-color: var(--element-border); background: rgba(0, 0, 0, 0.4);';
              let visionBadgeHtml = '';

              if (isSyntaxVisionActive) {
                if (isLineCorrect) {
                  edgeStyle = 'border-color: rgba(0, 255, 136, 0.35); background: rgba(0, 255, 136, 0.03);';
                  visionBadgeHtml = `<span style="font-size: 0.65rem; color: #00ff88; background: rgba(0,255,136,0.1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-sans); flex-shrink:0;">Aligned</span>`;
                } else {
                  edgeStyle = 'border-color: rgba(255, 165, 0, 0.4); background: rgba(255, 165, 0, 0.04);';
                  visionBadgeHtml = `<span style="font-size: 0.65rem; color: #ffa500; background: rgba(255,165,0,0.1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-sans); flex-shrink:0;">Misplaced Block</span>`;
                }
              }

              return `
                <div class="arena-item" data-idx="${idx}" 
                     style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.85rem; gap: 15px; transition: all 0.2s; ${edgeStyle}">
                  <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                    <span style="color: var(--text-muted); font-weight: bold; width: 20px; flex-shrink: 0; font-family: var(--font-sans);">${idx + 1}</span>
                    <pre style="margin: 0; white-space: pre-wrap; color: var(--text-main); font-size: 0.85rem; font-weight: bold; overflow-x: auto; flex: 1;"><code>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                    ${visionBadgeHtml}
                  </div>
                  <div style="display: flex; gap: 5px; flex-shrink: 0;">
                    <button class="arena-up-btn btn-neon" data-idx="${idx}" style="padding: 4px 10px; font-size: 0.75rem; background: transparent; border-color: var(--cyan); border-radius: 4px; color: var(--text-main); cursor: pointer;" title="Move Up">▲</button>
                    <button class="arena-down-btn btn-neon" data-idx="${idx}" style="padding: 4px 10px; font-size: 0.75rem; background: transparent; border-color: var(--purple); border-radius: 4px; color: var(--text-main); cursor: pointer;" title="Move Down">▼</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Bottom Verify & Feedback Section -->
        <div>
          <button id="verify-arena-btn" class="btn-neon" 
                  style="width: 100%; display: flex; justify-content: center; padding: 14px; font-weight: bold; font-size: 1rem; border-color: var(--cyan); color: var(--text-main); background: transparent; cursor: pointer;">
            Verify Structural Alignment
          </button>
          
          <div id="arena-feedback-bar" style="margin-top: 15px; padding: 12px; border-radius: 6px; font-weight: 600; text-align: center; font-size: 0.95rem; display: none;"></div>
        </div>

        <!-- Hint block structure -->
        <div id="arena-hint-box" style="padding: 12.5px 15px; background: rgba(255, 165, 0, 0.08); border-left: 4px solid #ffa500; border-radius: 4px;">
          ${isHintActive ? `
            <div style="font-size: 0.8rem; font-weight: bold; text-transform: uppercase; color: #ffa500; letter-spacing: 0.5px; margin-bottom: 4px;">💡 Helpful Hint</div>
            <p style="margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--text-main); font-family: inherit;">
              ${puzzle.hint}
            </p>
          ` : `
            <div style="text-align: center; padding: 10px 0;">
              <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Need assistance? Unlock a pedagogical hint capsule to guide your logical thinking!</p>
              ${(user.logicKeys || 0) >= 1 ? `
                <button id="unlock-hint-btn" class="btn-neon" style="padding: 6px 15px; font-size: 0.78rem; border-color: var(--cyan); color: var(--text-main); font-weight: bold; background: transparent; cursor: pointer;">
                  Unlock Hint Capsule 💡 (Cost: 1 Logic Key 🗝️)
                </button>
              ` : `
                <button class="btn-neon" style="padding: 6px 15px; font-size: 0.78rem; border-color: var(--element-border); color: var(--text-muted); background: rgba(0,0,0,0.3); cursor: not-allowed;" disabled>
                  💡 Hint Capsule Locked (Need 1 🗝️)
                </button>
              `}
            </div>
          `}
        </div>

      </div>
    `;
  }

  const selectedLang = window.practiceLanguageFilter || 'All';

  // Sidebar navigation grouping elements by categories
  let sideListHtml = ARENAS.map(arena => {
    const isArenaUnlocked = user.unlockedPracticeArenas.includes(arena.id);
    let arenaPuzzles = SUPPORTED_PRACTICE_PUZZLES.filter(p => p.arenaId === arena.id);
    
    if (selectedLang !== 'All') {
      arenaPuzzles = arenaPuzzles.filter(p => detectLanguage(p.title) === selectedLang);
    }
    
    if (arenaPuzzles.length === 0) {
      return '';
    }
    
    return `
      <div style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 6px;">
        <div style="font-size: 0.73rem; font-weight: bold; text-transform: uppercase; color: ${isArenaUnlocked ? 'var(--purple)' : 'var(--text-muted)'}; letter-spacing: 0.5px; border-bottom: 1.5px dashed rgba(176,38,255,0.15); padding-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
          <span>${arena.name}</span>
          ${!isArenaUnlocked ? `<span style="color: var(--cyan); font-weight: bold;">🔒 Unlock: ${arena.cost} 🗝️</span>` : ''}
        </div>
        ${arenaPuzzles.map(p => {
          const isCompleted = user.practiceArenaCompleted.includes(p.id);
          const isActive = p.id === activePuzzleId;
          
          let bgSty = 'transparent';
          if (isActive) bgSty = 'rgba(0, 243, 255, 0.08)';
          
          let borderCol = isActive ? 'var(--cyan)' : 'var(--element-border)';
          let titleCol = isActive ? 'var(--cyan)' : (isCompleted ? 'var(--purple)' : 'var(--text-muted)');
          
          return `
            <button class="puzzle-select-btn" data-id="${p.id}" 
                    style="text-align: left; background: ${bgSty}; border: 1.5px solid ${borderCol}; border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.2s ease-in-out; display: flex; flex-direction: column; gap: 4px; width: 100%;">
               <span style="font-weight: bold; color: ${titleCol}; font-family: inherit; font-size: 0.8rem; line-height: 1.25;">
                ${!isArenaUnlocked ? '🔒 ' : ''}${p.title}
              </span>
              <span style="font-size: 0.68rem; color: var(--text-muted); font-family: inherit;">
                ${isCompleted ? '✓ Completed (+15 Sparks)' : 'Incomplete'}
              </span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }).filter(Boolean).join('');

  let html = `
    <div class="fade-in" style="max-width: 1100px; margin: 0 auto; padding: 20px; box-sizing: border-box; font-family: var(--font-sans);">
      
      <!-- Top back navigation layout displaying both currencies -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 15px;">
        <div>
          <a href="#dashboard" class="btn-neon" style="text-decoration: none; padding: 8px 16px; font-size: 0.85rem; border-color: var(--element-border); color: var(--text-muted); background: transparent;">
            &larr; Return Dashboard
          </a>
        </div>
        <div style="display: flex; gap: 20px; text-align: right; justify-content: flex-end; align-items: center;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">✨ Sparks Balance</div>
            <div class="text-gradient" style="font-size: 1.3rem; font-weight: 800; font-family: var(--font-mono);">${user.skillSparks || 0} ✨ Sparks</div>
          </div>
          <div style="border-left: 2px solid var(--element-border); padding-left: 20px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">🗝️ Logic Keys</div>
            <div style="font-size: 1.3rem; font-weight: 800; font-family: var(--font-mono); color: var(--cyan); text-shadow: 0 0 10px var(--cyan-glow);">${user.logicKeys || 0} 🗝️ Keys</div>
          </div>
        </div>
      </div>

      <!-- Welcome panel introduction -->
      <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem; border-color: rgba(0, 243, 255, 0.25);">
        <h1 class="text-gradient" style="margin: 0 0 8px 0; font-size: 2rem; font-weight: 800; font-family: var(--font-sans);">Practice Arena</h1>
        <p style="margin: 0; color: var(--text-muted); font-size: 1rem; line-height: 1.5; font-family: var(--font-sans);">
          Improve your core logical and syntactical typing skills easily. Read instructions, then arrange split programming instructions lines into their exact executable sequences using the up and down arrow keys. Use Logic Keys 🗝️ to unlock intermediate and advanced arenas or helper capsules!
        </p>
      </div>

      <!-- Main Columns Grid mapping -->
      <div class="arena-grid">
        
        <!-- Sidebar Column levels mapping grouped by Arena -->
        <div class="glass-panel" style="padding: 1rem; display: flex; flex-direction: column; gap: 14px; box-sizing: border-box;">
          <h3 style="margin: 0 0 5px 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: var(--purple); font-weight: bold; padding-bottom: 3px;">Puzzles</h3>
          
          <!-- Programming Language Filter Bar -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--element-border); border-radius: 8px; padding: 10px; width: 100%; box-sizing: border-box;">
            <div style="font-size: 0.72rem; font-weight: bold; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
              <span>Language Filter</span>
              ${selectedLang !== 'All' ? `
                <button id="clear-lang-filter-btn" style="background: none; border: none; color: var(--cyan); font-size: 0.72rem; cursor: pointer; padding: 0; font-family: inherit; font-weight: bold;">
                  Clear
                </button>
              ` : ''}
            </div>
            
            <div class="lang-filter-scroll-container" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; max-width: 100%;">
              ${availableLanguages.map(lang => {
                const isSelected = selectedLang === lang;
                const activeColor = isSelected ? 'var(--cyan)' : 'var(--element-border)';
                const textColor = isSelected ? 'var(--bg-dark)' : 'var(--text-muted)';
                const bgSty = isSelected ? 'var(--cyan)' : 'rgba(0, 0, 0, 0.2)';
                const fontWeight = isSelected ? 'bold' : 'normal';
                
                return `
                  <button class="lang-pill-btn" data-lang="${lang}" 
                          style="white-space: nowrap; font-size: 0.75rem; font-weight: ${fontWeight}; border: 1.5px solid ${activeColor}; background: ${bgSty}; color: ${textColor}; padding: 4px 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease-in-out;">
                    ${lang}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          ${sideListHtml || `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 15px 5px;">No puzzles match selected filter</div>`}
        </div>

        <!-- Workplace Arena Column mapping -->
        <div style="display: flex; flex-direction: column; gap: 15px;">
          ${workspaceHtml}
        </div>

      </div>

    </div>
  `;

  return html;
}

export function mountPracticeArena() {
  const user = getCurrentUser();
  if (!user) return;

  // Handle programming language filter changes
  const langPills = document.querySelectorAll('.lang-pill-btn');
  langPills.forEach(pill => {
    pill.onclick = function() {
      const selectedLang = this.getAttribute('data-lang');
      window.practiceLanguageFilter = selectedLang;
      // Fire hashchange so the router re-renders the Practice Arena dynamically
      window.dispatchEvent(new Event('hashchange'));
    };
  });

  const clearLangFilterBtn = document.getElementById('clear-lang-filter-btn');
  if (clearLangFilterBtn) {
    clearLangFilterBtn.onclick = function() {
      window.practiceLanguageFilter = 'All';
      window.dispatchEvent(new Event('hashchange'));
    };
  }

  const puzzleSelBtns = document.querySelectorAll('.puzzle-select-btn');
  
  // Trigger switch levels
  puzzleSelBtns.forEach(btn => {
    btn.onclick = function() {
      const pId = parseInt(this.getAttribute('data-id'), 10);
      activePuzzleId = pId;
      window.location.hash = '#practice-arena'; // Refresh same view
    };
  });

  // Action Click Handler: Unlock Arena Category
  const unlockArenaBtn = document.getElementById('unlock-arena-submit-btn');
  if (unlockArenaBtn) {
    unlockArenaBtn.onclick = function() {
      const arenaId = this.getAttribute('data-arena-id');
      const cost = parseInt(this.getAttribute('data-cost'), 10);

      user.unlockedPracticeArenas = user.unlockedPracticeArenas || ['basic'];
      if ((user.logicKeys || 0) >= cost) {
        user.logicKeys -= cost;
        user.unlockedPracticeArenas.push(arenaId);
        saveUser(user);
        window.location.hash = '#practice-arena';
      }
    };
  }

  // Action Click Handler: Unlock Hint Capsule
  const unlockHintBtn = document.getElementById('unlock-hint-btn');
  if (unlockHintBtn) {
    unlockHintBtn.onclick = function() {
      user.unlockedPracticeHints = user.unlockedPracticeHints || [];
      if ((user.logicKeys || 0) >= 1) {
        user.logicKeys -= 1;
        user.unlockedPracticeHints.push(activePuzzleId);
        saveUser(user);
        window.location.hash = '#practice-arena';
      }
    };
  }

  // Action Click Handler: Activate Syntax Vision 👀
  const activateVisionBtn = document.getElementById('activate-syntax-vision-btn');
  if (activateVisionBtn) {
    activateVisionBtn.onclick = function() {
      user.unlockedSyntaxVision = user.unlockedSyntaxVision || [];
      if ((user.logicKeys || 0) >= 1) {
        user.logicKeys -= 1;
        user.unlockedSyntaxVision.push(activePuzzleId);
        saveUser(user);
        window.location.hash = '#practice-arena';
      }
    };
  }

  // Action Click Handler: Restart / Practice Again Puzzle Replay
  const restartPuzzleBtn = document.getElementById('restart-puzzle-btn');
  if (restartPuzzleBtn) {
    restartPuzzleBtn.onclick = function() {
      currentShuffledLines = [];
      window.location.hash = '#practice-arena';
    };
  }

  const verifyBtn = document.getElementById('verify-arena-btn');
  const feedbackBar = document.getElementById('arena-feedback-bar');
  const listContainer = document.getElementById('arena-items-list');

  if (!listContainer || !verifyBtn) return;

  const puzzle = SUPPORTED_PRACTICE_PUZZLES.find(p => p.id === activePuzzleId) || SUPPORTED_PRACTICE_PUZZLES[0];
  const isPuzzleCompleted = user.practiceArenaCompleted.includes(puzzle.id);
  const isSyntaxVisionActive = isPuzzleCompleted || user.unlockedSyntaxVision.includes(puzzle.id);

  const bindSwapButtons = () => {
    const upBtns = document.querySelectorAll('.arena-up-btn');
    const downBtns = document.querySelectorAll('.arena-down-btn');

    upBtns.forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        const idx = parseInt(this.getAttribute('data-idx'), 10);
        if (idx > 0) {
          const temp = currentShuffledLines[idx - 1];
          currentShuffledLines[idx - 1] = currentShuffledLines[idx];
          currentShuffledLines[idx] = temp;
          reRenderItemsList();
        }
      };
    });

    downBtns.forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        const idx = parseInt(this.getAttribute('data-idx'), 10);
        if (idx < currentShuffledLines.length - 1) {
          const temp = currentShuffledLines[idx + 1];
          currentShuffledLines[idx + 1] = currentShuffledLines[idx];
          currentShuffledLines[idx] = temp;
          reRenderItemsList();
        }
      };
    });
  };

  const reRenderItemsList = () => {
    if (!listContainer) return;
    
    listContainer.innerHTML = currentShuffledLines.map((line, idx) => {
      const isLineCorrect = line === puzzle.correctOrder[idx];
      
      let edgeStyle = 'border-color: var(--element-border); background: rgba(0, 0, 0, 0.4);';
      let visionBadgeHtml = '';

      if (isSyntaxVisionActive) {
        if (isLineCorrect) {
          edgeStyle = 'border-color: rgba(0, 255, 136, 0.35); background: rgba(0, 255, 136, 0.03);';
          visionBadgeHtml = `<span style="font-size: 0.65rem; color: #00ff88; background: rgba(0,255,136,0.1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-sans); flex-shrink:0;">Aligned</span>`;
        } else {
          edgeStyle = 'border-color: rgba(255, 165, 0, 0.4); background: rgba(255, 165, 0, 0.04);';
          visionBadgeHtml = `<span style="font-size: 0.65rem; color: #ffa500; background: rgba(255,165,0,0.1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-sans); flex-shrink:0;">Misplaced Block</span>`;
        }
      }

      return `
        <div class="arena-item" data-idx="${idx}" 
             style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.85rem; gap: 15px; transition: all 0.2s; ${edgeStyle}">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
            <span style="color: var(--text-muted); font-weight: bold; width: 20px; flex-shrink: 0; font-family: var(--font-sans);">${idx + 1}</span>
            <pre style="margin: 0; white-space: pre-wrap; color: var(--text-main); font-size: 0.85rem; font-weight: bold; overflow-x: auto; flex: 1;"><code>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
            ${visionBadgeHtml}
          </div>
          <div style="display: flex; gap: 5px; flex-shrink: 0;">
            <button class="arena-up-btn btn-neon" data-idx="${idx}" style="padding: 4px 10px; font-size: 0.75rem; background: transparent; border-color: var(--cyan); border-radius: 4px; color: var(--text-main); cursor: pointer;" title="Move Up">▲</button>
            <button class="arena-down-btn btn-neon" data-idx="${idx}" style="padding: 4px 10px; font-size: 0.75rem; background: transparent; border-color: var(--purple); border-radius: 4px; color: var(--text-main); cursor: pointer;" title="Move Down">▼</button>
          </div>
        </div>
      `;
    }).join('');

    bindSwapButtons();
  };

  // Initial binding
  bindSwapButtons();

  // Perform alignment validation
  verifyBtn.onclick = function() {
    const isCorrect = JSON.stringify(currentShuffledLines) === JSON.stringify(puzzle.correctOrder);

    if (isCorrect) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.85 }
      });

      // Claim reward logic
      user.practiceArenaCompleted = user.practiceArenaCompleted || [];
      const alreadyCompleted = user.practiceArenaCompleted.includes(puzzle.id);

      if (feedbackBar) {
        feedbackBar.style.display = 'block';
        feedbackBar.style.color = '#00FF88';
        feedbackBar.style.background = 'rgba(0, 255, 136, 0.08)';
        
        if (alreadyCompleted) {
          feedbackBar.innerHTML = '✨ Revision perfect! You completed this practice session again and earned +1 Spark revision reward!';
          awardSkillSparks(1);
        } else {
          // Track attempts
          const attempts = window.practiceAttempts[puzzle.id] || 0;
          let keysEarned = 1;
          let rewardMsg = '+1 Logic Key 🗝️';
          if (attempts === 0) {
            keysEarned = 2;
            rewardMsg = 'PERFECT PRACTICE! +2 Logic Keys 🗝️ & +15 Sparks!';
          } else {
            rewardMsg = '+1 Logic Key 🗝️ & +15 Sparks!';
          }

          feedbackBar.innerHTML = `Syntax structure aligned perfectly! Excellent logical ordering! You earned: ${rewardMsg}`;
          
          user.practiceArenaCompleted.push(puzzle.id);
          awardSkillSparks(15);
          awardLogicKeys(keysEarned);
        }
      }

      setTimeout(() => {
        window.location.hash = '#practice-arena';
      }, 2000);

    } else {
      // Increment attempt counter for non-perfect progression
      window.practiceAttempts[puzzle.id] = (window.practiceAttempts[puzzle.id] || 0) + 1;

      if (feedbackBar) {
        feedbackBar.style.display = 'block';
        feedbackBar.style.color = '#FF3366';
        feedbackBar.style.background = 'rgba(255, 51, 102, 0.08)';
        feedbackBar.innerHTML = 'Structural alignment is not quite correct yet. Swap statements and try again!';
      }
    }
  };
}
