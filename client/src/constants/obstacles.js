export const OBSTACLES = [];

const baseColors = ['#8b7355', '#556b2f', '#444444', '#708090', '#3b3b3b'];
const rCol = () => baseColors[Math.floor(Math.random() * baseColors.length)];

// Scaled Outer World Native Arena Boundaries explicitly mapping 100x100 arenas mathematically!
OBSTACLES.push({ position: [0, 5, -50], size: [100, 10, 2], color: '#222' });
OBSTACLES.push({ position: [0, 5, 50], size: [100, 10, 2], color: '#222' });
OBSTACLES.push({ position: [-50, 5, 0], size: [2, 10, 100], color: '#222' });
OBSTACLES.push({ position: [50, 5, 0], size: [2, 10, 100], color: '#222' });

// Elevated Platforms and Sniping Nests replacing flat geometry
OBSTACLES.push({ position: [20, 1.5, 20], size: [10, 3, 10], color: '#556b2f' }); // Central Platform East
OBSTACLES.push({ position: [25, 0.5, 13], size: [4, 1, 4], color: '#444' });   // Step 1
OBSTACLES.push({ position: [25, 1.0, 17], size: [4, 2, 4], color: '#444' });   // Step 2

OBSTACLES.push({ position: [-20, 2, -20], size: [15, 4, 15], color: '#8b7355' }); // Central Platform West
OBSTACLES.push({ position: [-11, 1, -20], size: [4, 2, 4], color: '#444' });   // Step 1
OBSTACLES.push({ position: [-15, 1.5, -20], size: [4, 3, 4], color: '#444' }); // Step 2

// Center Maze Structure generating asymmetrical flow (clearing spawn origin natively!)
OBSTACLES.push({ position: [6, 2, 0], size: [4, 4, 2], color: '#708090' }); 
OBSTACLES.push({ position: [-6, 2, 0], size: [4, 4, 2], color: '#708090' }); 
OBSTACLES.push({ position: [-7, 2, 8], size: [2, 4, 14], color: '#3b3b3b' }); 
OBSTACLES.push({ position: [7, 2, -8], size: [2, 4, 14], color: '#3b3b3b' }); 
OBSTACLES.push({ position: [0, 4, 0], size: [15, 0.5, 15], color: '#556b2f' }); // Catwalk

// Generating symmetric cover blocks implicitly around the map structurally
const generateSymmetricalCover = (x, z) => {
   // Height variations mapping complex covers dynamically
   const height = 3 + Math.random() * 3;
   const width = 2 + Math.random() * 6;
   const depth = 2 + Math.random() * 6;
   const col = rCol();

   OBSTACLES.push({ position: [x, height/2, z], size: [width, height, depth], color: col });
   OBSTACLES.push({ position: [-x, height/2, -z], size: [width, height, depth], color: col });
   OBSTACLES.push({ position: [x, height/2, -z], size: [width, height, depth], color: col });
   OBSTACLES.push({ position: [-x, height/2, z], size: [width, height, depth], color: col });
};

generateSymmetricalCover(35, 35);
generateSymmetricalCover(15, 40);
generateSymmetricalCover(40, 15);
generateSymmetricalCover(25, 5);
