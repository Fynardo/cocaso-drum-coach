export const Logger = {
    debugMode: false,

    debug: function(system, message) {
        if (this.debugMode) {
            console.log(system + ": " + message);
        }
    },

    error: function(system, message) {
        console.error(system + ": " + message);
    }
}