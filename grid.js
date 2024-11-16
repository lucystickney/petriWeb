const canvas = document.getElementById('colorGrid');
const ctx = canvas.getContext('2d');
const gridSize = 300; // Number of squares along one side of the grid
let squareSize;
let colors = [];    // colors of all indexes -> index of array is index of grid
let activeSquares = []; // indexes of active mold
let currentColor = randomColorArray();
let isStarted = false;
let surrounded = [];

let worker;
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');

// sets up background work
if (window.Worker) {
    // create a new worker
    worker = new Worker('worker.js');

    // set up a listener for the worker
    worker.onmessage = function(event) {
        console.log("grow is called");
        grow();
    };


    // Optional: Terminate the worker when not needed
    // window.addEventListener('beforeunload', function() {
    //     worker.terminate();
    // });

    startButton.addEventListener('click', () => {
        isStarted = true;
        overlay.style.display = 'none'; // Hide the start button after starting
        worker.postMessage('start');
        loadColors();
        //stopButton.style.display = 'block'; // show stop button
    });

} else {
    console.log('browser doesn’t support web workers.');
}

    
// Function to resize the canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;  // set canvas width to window width
    canvas.height = window.innerHeight; // set canvas height to window height
    squareSize = canvas.width / gridSize;
}


// Function to calculate the clicked square and change its color
function handleCanvasClick(event) {
    if (!isStarted) return; // Only respond to clicks if start button is clicked

    console.log("it has started");
    const rect = canvas.getBoundingClientRect(); // gets dimensions of canvas
    const x = event.clientX - rect.left; // x-coordinate within the canvas
    const y = event.clientY - rect.top;  // y-coordinate within the canvas

    // Calculate row and column based on click position
    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);
    const index = row * gridSize + col; // finds index

    // if clicked square is not already a color
    if (colors[index] === 'rgba(0, 255, 0, 0)') {
        // Change color of clicked square
        colors[index] = rgbArrayToString(currentColor); // new color for clicked square
        // add clicked to active array
        activeSquares.push(index);
    }
    
}



// stopButton.addEventListener('click', () => {
//     isStarted = false;
//     //startButton.style.display = 'none'; // Hide the start button after starting
//     stopButton.style.display = 'block'; // show stop button
//     worker.postMessage('stop');
// });

// Load colors from localStorage or initialize a new array
function loadColors() {
    // const savedColors = localStorage.getItem('gridColors');
    
    // if (savedColors) {
    //     //activeSquares = localStorage.getItem('actives');
    //     console.log("colors are saved");
    //     colors = JSON.parse(savedColors);

    //     // resend the background timer
    //     worker.postMessage('start');

    // } else {

        // we want to start with a blank
        // possibly start with a click where the first mold starts
        for (let i = 0; i < gridSize * gridSize; i++) {
            colors.push('rgba(0, 255, 0, 0)');
        }
        // colors[525] = rgbArrayToString(currentColor);
        // activeSquares.push(525);

        // colors[8070] = rgbArrayToString(currentColor);
        // activeSquares.push(8070);
    // }
}

// start with all clear colors in colors or null
// 

// index of squares:
// const row = Math.floor(i / gridSize);
// const col = i % gridSize;

// Save colors to localStorage
function saveColors() {
    localStorage.setItem('gridColors', JSON.stringify(colors));
}

function saveActives() {
    localStorage.setItem('actives', JSON.stringify(activeSquares));
}

// TODO: we want to generate a color that is similar to the previous random color. 
// Change it slighly and randomly after every call
function randomColorArray() {
    const r = Math.floor(Math.random() * 256); // Random value between 0-255
    const g = Math.floor(Math.random() * 256); // Random value between 0-255
    const b = Math.floor(Math.random() * 256); // Random value between 0-255
    return [r, g, b]; // Return as an array
}


function randomColorGreen() {
    const r = Math.floor(Math.random() * 256); // Random value between 0-255
    const g = Math.floor(Math.random() * 100); // Random value between 0-255
    const b = Math.floor(Math.random() * 100); // Random value between 0-255
    return [r, g, b]; // Return as an array
}

function rgbArrayToString(rgbArray) {
    if (rgbArray.length !== 3) {
        throw new Error("Input must be an array of three numbers representing RGB values.");
    }
    const [r, g, b] = rgbArray; // Destructure the array
    return `rgb(${r}, ${g}, ${b})`; // Format as rgb() string
}

function updateColor() {
    // If no previous color is provided, generate a random color

    // Get the RGB values of the previous color
    const r = currentColor[0]; // Access the first element (Red)
    const g = currentColor[1]; // Access the second element (Green)
    const b = currentColor[2]; // Access the third element (Blue)


    // Define the range for variation (adjust this for larger or smaller variations)
    const variation = 10; // Adjust this value as needed

    // Generate new RGB values with random adjustments
    const newR = clamp(r - variation, 0, 255);
    const newG = clamp(g - variation, 0, 255);
    const newB = clamp(b - variation, 0, 255);
// Check if the color has reached its boundaries and consider resetting
    if (newR === 0 || newR === 255 || newG === 0 || newG === 255 || newB === 0 || newB === 255) {
        //currentColor = randomColorArray(); // Reset to a new random color
        currentColor = randomColorArray();
    } else {
        currentColor = [newR, newG, newB];
    }
}

// passed in is the index of the colors array
function surroundingUpdateColor(index) {

}

// // Helper function to get a random variation
// function getRandomVariation(maxVariation) {
//     return Math.floor(Math.random() * (maxVariation * 2 + 1)) - maxVariation;
// }

// Helper function to clamp values within a range
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// // Example usage:
// let previousColor = randomColor(); // Generate an initial random color
// console.log(`Initial color: rgb(${previousColor.r}, ${previousColor.g}, ${previousColor.b})`);

// previousColor = randomColor(previousColor); // Generate a new color based on the previous one
// console.log(`New color: rgb(${previousColor.r}, ${previousColor.g}, ${previousColor.b})`);



// Draw the grid
function drawGrid() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const color = colors[row * gridSize + col];
            ctx.fillStyle = color;
            ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
        }
    }
}

// Update the grid colors and redraw
// function updateColors() {
//     //colors = colors.map(() => randomColor()); // Change color of each square
//     saveColors();
//     drawGrid();
// }


// TODO: function to determine which squares get grown
// take existing squares, and grow in each direction
function grow() {
    const newActives = [];
    //console.log("active length: ", activeSquares.length);
    // Loop over all currently active squares
    activeSquares.forEach(i => {
        if (surrounded[i] === 1) {
            return;
        }
        // Calculate neighbors (left, right, up, down)
        const neighbors = [
            i - 1,               // Left
            i + 1,               // Right
            i - gridSize,        // Up
            i + gridSize         // Down
        ];


        // Filter valid neighbors
        let neighborCount = 0;
        neighbors.forEach(j => {
            
            // Value is not in the array
            if (!activeSquares.includes(j)) {
                // Value is not in the array
                if (j < 0 || j >= gridSize * gridSize) {
                    // out of bounds left and right
                    return;
                } else if ((i % gridSize === 0 && j === i - 1) || (i % gridSize === gridSize - 1 && j === i + 1)) {
                    // out of bounds top and bottom
                    return;
                } else if (Math.random() > 0.5) {
                    newActives.push(j);
                    colors[j] = rgbArrayToString(currentColor);
                }
            } else {
                neighborCount++;
                if (neighborCount === 4) {
                    surrounded[i] = 1;
                }
            }
        
            // check if its already in active Squares
            // check if its in a boundary
            // else, randomly add to actives and generate color for color array
        })

    });

    // Update active squares and draw the grid
    activeSquares = [...activeSquares, ...newActives];
    updateColor();
    drawGrid();
    saveColors();
    saveActives();
    if (activeSquares.length === gridSize * gridSize) {
        worker.postMessage('stop');
    }
}

// start worker



// Call the resize function to set initial size
resizeCanvas();

// Add an event listener to resize the canvas when the window size changes
window.addEventListener('resize', resizeCanvas);


// Initialize grid and set a timer for updates
//loadColors();


//drawGrid();
canvas.addEventListener('click', handleCanvasClick);
//setInterval(grow, 3600); // Update every hour (3600000 ms)

