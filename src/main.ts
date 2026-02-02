import * as Sweepweave from './sweepweave';

const storyworld = new Sweepweave.Storyworld();
const defaultEncounter = new Sweepweave.Encounter('encounter_1', 'First Encounter');
storyworld.encounters.push(defaultEncounter);
storyworld.encounter_directory.set(defaultEncounter.id, defaultEncounter);

console.log('Sweepweave Storyworld instantiated:', storyworld);
console.log('Sweepweave Encounter instantiated:', defaultEncounter);

const root = document.createElement('div');
root.id = 'app';
root.style.display = 'flex';
root.style.gap = '16px';

const leftColumn = document.createElement('div');
leftColumn.style.flex = '1';
leftColumn.textContent = 'Encounters';

const centerColumn = document.createElement('div');
centerColumn.style.flex = '2';
centerColumn.textContent = `Encounter editor: ${defaultEncounter.title}`;

const rightColumn = document.createElement('div');
rightColumn.style.flex = '1';
rightColumn.textContent = 'Reactions';

root.append(leftColumn, centerColumn, rightColumn);
document.body.appendChild(root);
