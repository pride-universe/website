const sharp = require('sharp');

const create = (background, worker) => {
  console.log(worker+': '+background);
	return sharp({
		create: {
			background: '#'+background,
			channels: 4,
			height: 1,
			width: 1,
		},
	}).toFile(`images/${background}.png`);
};

let i = -1;
let workers = 0;
async function worker() {
  const worker = workers++;
  while(++i <= 0xFFFFFF) {
    await create(i.toString(16).padStart(6,'0'), worker);
  }
}

worker();
worker();
worker();
worker();
worker();