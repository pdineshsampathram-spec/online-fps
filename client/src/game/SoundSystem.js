const sounds = {
  shoot: new Audio('/sounds/shoot.mp3'),
  reload: new Audio('/sounds/reload.mp3'),
  hit: new Audio('/sounds/hit.mp3'),
  death: new Audio('/sounds/death.mp3')
};
Object.values(sounds).forEach(s => s.volume = 0.2);

export const playSound = (name) => {
  if (sounds[name]) {
    sounds[name].currentTime = 0; 
    sounds[name].play().catch(e => {  });
  }
};
