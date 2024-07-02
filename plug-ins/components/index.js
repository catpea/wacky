import Workspace from './Workspace.js';
import Group from './Group.js';
import Hello from './Hello.js';
import Terminal from './Terminal.js';
import Editor from './Editor.js';
import Pipe from './Pipe.js';

import Architecture from './Architecture.js';
import Analysis from './Analysis.js';

// Dependency Injection Pattern

const components = {
  Workspace,

  Group,
  Pipe,

  Hello,

  Architecture,
  Analysis,

  Terminal,
  Editor,
}

export default components;
