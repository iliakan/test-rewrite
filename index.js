#!/usr/bin/env node
const OpenAI = require('openai');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY2']
});

const argv = yargs(hideBin(process.argv))
  .demandOption('project', 'Please provide the project path')
  .usage('./index.js --project=/opt/tmp/tasks-nodejs-5/03-streams/05-file-server-delete')
  .parse();

async function main() {

  let projectFiles = glob.sync('**/*.{js,json}', {
    cwd: argv.project,
    ignore: ['node_modules/**'],
    nodir: true,
  });

  console.log(projectFiles)

  let messages = [{
    role: 'system', content: `
You are a Node.js engineer with expert knowledge of modules mocha, chai and the project.
Follow the user's requirements carefully & to the letter.
Make sure that the code you generate uses methods that actually exist and the calls are made with correct arguments.

Read the provided project files to understand the project.
`
  }]

  let projectMessage = '';
  for (let file of projectFiles) {
    let fileContent = fs.readFileSync(path.join(argv.project, file), 'utf8');
    projectMessage += `\n\n# FILE: ${file}\n${fileContent}`;
  }

  messages.push({ role: 'user', content: `Project files:\n\n${projectMessage}`});

  messages.push({ role: 'user', content: `Rewrite the file src/test/server.test.js:
- Replace usage of "mocha" testing module with "node:test"
- Replace uses of "chai" node modules with corresponding "node:assert" calls
Double-check your answer to ensure that the resulting test file runs without errors.
Respond ONLY with the code of the new file.
  `});

  console.log(messages);

  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: 'gpt-4-1106-preview',
  });
  console.log(chatCompletion.choices[0].message.content);
}




main();
