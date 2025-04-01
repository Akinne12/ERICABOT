// errorHandler.js

module.exports = {
    handleError: (error, context) => {
      console.error(`Error in ${context}:`, error);
  
      // Optional: Log errors to a file
      const fs = require('fs');
      const logMessage = `${new Date().toISOString()} - Error in ${context}: ${error.stack || error}\n`;
      fs.appendFileSync('logs/error.log', logMessage);
  
      // Send error message to Discord (if applicable)
      if (context.channel) {
        context.channel.send('An error occurred. Please try again later.');
      }
    }
  };
  