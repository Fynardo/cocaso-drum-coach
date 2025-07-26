export const Logger = {
    debugMode: false,

    debug: function(message) {
        if (this.debugMode) {
            console.log(message);
        }
    },

    error: function(message) {
        console.error(message);
    }
}