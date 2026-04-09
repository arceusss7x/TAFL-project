// PDA Engine - supports nondeterminism via BFS, epsilon transitions
// Acceptance: by final state OR empty stack

export const EPSILON = 'ε';

/**
 * A single PDA configuration: { state, input (remaining), stack (array, top=last) }
 */

/**
 * Get all transitions matching (state, inputSymbol, stackTop)
 * inputSymbol can be EPSILON for epsilon transitions
 */
export function getMatchingTransitions(transitions, state, inputSymbol, stackTop) {
  return transitions.filter(t =>
    t.from === state &&
    (t.input === inputSymbol || t.input === EPSILON) &&
    (t.stackTop === stackTop || t.stackTop === EPSILON)
  );
}

/**
 * Apply a transition to a configuration, returning new configuration or null
 */
export function applyTransition(config, transition) {
  const { state, input, stack } = config;
  const newStack = [...stack];

  // Pop stack top if transition requires it
  if (transition.stackTop !== EPSILON) {
    if (newStack.length === 0 || newStack[newStack.length - 1] !== transition.stackTop) {
      return null; // stack top mismatch
    }
    newStack.pop();
  }

  // Push new symbols (push string, left-to-right means rightmost is new top)
  if (transition.push !== EPSILON && transition.push !== '') {
    const pushSymbols = transition.push.split('');
    // push in reverse so first char ends up on top
    for (let i = pushSymbols.length - 1; i >= 0; i--) {
      newStack.push(pushSymbols[i]);
    }
  }

  // Consume input symbol if not epsilon
  let newInput = input;
  if (transition.input !== EPSILON) {
    if (input.length === 0 || input[0] !== transition.input) return null;
    newInput = input.slice(1);
  }

  return {
    state: transition.to,
    input: newInput,
    stack: newStack,
  };
}

/**
 * Check acceptance
 */
export function isAccepted(config, acceptStates, acceptMode) {
  if (acceptMode === 'finalState') {
    return config.input.length === 0 && acceptStates.includes(config.state);
  } else if (acceptMode === 'emptyStack') {
    return config.input.length === 0 && config.stack.length === 0;
  } else {
    // both
    return config.input.length === 0 &&
      (acceptStates.includes(config.state) || config.stack.length === 0);
  }
}

/**
 * BFS simulation - returns array of steps for the ACCEPTING path (or rejection path)
 * Each step: { config, transition (or null for initial), depth }
 */
export function simulate(pdaDef, inputString) {
  const { transitions, startState, acceptStates, initialStackSymbol, acceptMode } = pdaDef;

  const initialConfig = {
    state: startState,
    input: inputString,
    stack: initialStackSymbol ? [initialStackSymbol] : [],
  };

  // BFS: each node = { config, path: [{config, transition}] }
  const queue = [{ config: initialConfig, path: [{ config: initialConfig, transition: null }] }];
  const visited = new Set();
  const configKey = (c) => `${c.state}|${c.input}|${c.stack.join(',')}`;

  let rejectionPath = [{ config: initialConfig, transition: null }];

  while (queue.length > 0) {
    const { config, path } = queue.shift();
    const key = configKey(config);
    if (visited.has(key)) continue;
    visited.add(key);

    if (isAccepted(config, acceptStates, acceptMode)) {
      return { accepted: true, path };
    }

    // Get all applicable transitions
    const inputSym = config.input.length > 0 ? config.input[0] : null;
    const stackTop = config.stack.length > 0 ? config.stack[config.stack.length - 1] : null;

    // Collect all transitions from this state
    const applicable = transitions.filter(t => {
      if (t.from !== config.state) return false;
      // Input must match: either epsilon transition or matches current input symbol
      const inputOk = t.input === EPSILON || (inputSym !== null && t.input === inputSym);
      // Stack top must match: either epsilon (don't care) or matches actual stack top
      const stackOk = t.stackTop === EPSILON || (stackTop !== null && t.stackTop === stackTop);
      return inputOk && stackOk;
    });

    for (const t of applicable) {
      const newConfig = applyTransition(config, t);
      if (newConfig && !visited.has(configKey(newConfig))) {
        const newPath = [...path, { config: newConfig, transition: t }];
        queue.push({ config: newConfig, path: newPath });
        if (rejectionPath.length < newPath.length) rejectionPath = newPath;
      }
    }
  }

  return { accepted: false, path: rejectionPath };
}
