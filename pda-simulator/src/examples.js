export const EXAMPLES = [
  {
    name: 'aⁿbⁿ — Equal a\'s and b\'s',
    description: 'Accepts strings with equal number of a\'s followed by b\'s',
    pda: {
      states: ['q0', 'q1', 'q2'],
      inputAlphabet: ['a', 'b'],
      stackAlphabet: ['A', 'Z'],
      startState: 'q0',
      acceptStates: ['q2'],
      initialStackSymbol: 'Z',
      acceptMode: 'finalState',
      transitions: [
        { from: 'q0', input: 'a', stackTop: 'Z', to: 'q1', push: 'AZ' },
        { from: 'q1', input: 'a', stackTop: 'A', to: 'q1', push: 'AA' },
        { from: 'q1', input: 'b', stackTop: 'A', to: 'q1', push: 'ε' },
        { from: 'q1', input: 'ε', stackTop: 'Z', to: 'q2', push: 'Z' },
      ],
    },
    testInputs: ['aabb', 'ab', 'aaabbb', 'aab', 'abb', ''],
  },
  {
    name: 'Balanced Parentheses',
    description: 'Accepts strings of balanced ( and ) parentheses',
    pda: {
      states: ['q0', 'q1'],
      inputAlphabet: ['(', ')'],
      stackAlphabet: ['P', 'Z'],
      startState: 'q0',
      acceptStates: ['q1'],
      initialStackSymbol: 'Z',
      acceptMode: 'finalState',
      transitions: [
        { from: 'q0', input: '(', stackTop: 'Z', to: 'q0', push: 'PZ' },
        { from: 'q0', input: '(', stackTop: 'P', to: 'q0', push: 'PP' },
        { from: 'q0', input: ')', stackTop: 'P', to: 'q0', push: 'ε' },
        { from: 'q0', input: 'ε', stackTop: 'Z', to: 'q1', push: 'Z' },
      ],
    },
    testInputs: ['()', '(())', '((()))', '()()', '(()', '())'],
  },
  {
    name: 'Palindromes over {a,b}',
    description: 'Accepts palindromes over alphabet {a, b} (nondeterministic)',
    pda: {
      states: ['q0', 'q1', 'q2'],
      inputAlphabet: ['a', 'b'],
      stackAlphabet: ['A', 'B', 'Z'],
      startState: 'q0',
      acceptStates: ['q2'],
      initialStackSymbol: 'Z',
      acceptMode: 'finalState',
      transitions: [
        // Push phase
        { from: 'q0', input: 'a', stackTop: 'Z', to: 'q0', push: 'AZ' },
        { from: 'q0', input: 'a', stackTop: 'A', to: 'q0', push: 'AA' },
        { from: 'q0', input: 'a', stackTop: 'B', to: 'q0', push: 'AB' },
        { from: 'q0', input: 'b', stackTop: 'Z', to: 'q0', push: 'BZ' },
        { from: 'q0', input: 'b', stackTop: 'A', to: 'q0', push: 'BA' },
        { from: 'q0', input: 'b', stackTop: 'B', to: 'q0', push: 'BB' },
        // Nondeterministic guess: middle reached (epsilon or single char)
        { from: 'q0', input: 'ε', stackTop: 'Z', to: 'q1', push: 'Z' },
        { from: 'q0', input: 'ε', stackTop: 'A', to: 'q1', push: 'A' },
        { from: 'q0', input: 'ε', stackTop: 'B', to: 'q1', push: 'B' },
        { from: 'q0', input: 'a', stackTop: 'A', to: 'q1', push: 'ε' },
        { from: 'q0', input: 'b', stackTop: 'B', to: 'q1', push: 'ε' },
        // Pop phase (match)
        { from: 'q1', input: 'a', stackTop: 'A', to: 'q1', push: 'ε' },
        { from: 'q1', input: 'b', stackTop: 'B', to: 'q1', push: 'ε' },
        // Accept
        { from: 'q1', input: 'ε', stackTop: 'Z', to: 'q2', push: 'Z' },
      ],
    },
    testInputs: ['aba', 'abba', 'aabaa', 'a', 'b', 'ab'],
  },
];
