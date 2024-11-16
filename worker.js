let count = 0;
let intervalId = null; // To keep track of the setInterval ID

// Function to start the clock
function startCounting() {
    console.log("starting count");
    if (!intervalId) { // Prevent multiple intervals from being created
        intervalId = setInterval(incrementTimer, 3600); // Increment every second
    }
}

// Function to stop counting
function stopCounting() {
    clearInterval(intervalId); // Clear the interval
    intervalId = null; // Reset the interval ID
    console.log("stopping growth");
}

// Function to increment count and post message
function incrementTimer() {
    count++;
    
    postMessage(count); // Send the updated count to the main thread
}

// Listen for messages from the main thread
self.onmessage = function(event) {
    console.log("reached worker");
    if (event.data === 'start') {
        startCounting(); // Start counting when 'start' message is received
        console.log("background called");
    } else if (event.data === 'stop') {
        stopCounting(); // Stop counting when 'stop' message is received
    }
};
