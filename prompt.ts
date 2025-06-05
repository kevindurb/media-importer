import readline from 'node:readline/promises';

const rl = readline.createInterface(process.stdin, process.stdout);

export const choose = async (items: string[]): Promise<string> => {
  for (const [idx, item] of items.entries()) {
    console.log(`${idx + 1}) ${item}`);
  }

  const response = await rl.question(`(1 - ${items.length}): `);
  const choiceIdx = Number.parseInt(response);
  const choice = items[choiceIdx - 1];

  if (Number.isNaN(choiceIdx) || !choice) throw new Error('incorrect choice');

  return choice;
};
