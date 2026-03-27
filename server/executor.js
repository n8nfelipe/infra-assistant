const { exec } = require("child_process");

function executeCommand(command, onData, onEnd, onError) {
    const process = exec(command);

    process.stdout.on("data", (data) => {
        onData(data.toString());
    });

    process.stderr.on("data", (data) => {
        onData(data.toString()); // Treat stderr as part of the output stream
    });

    process.on("close", (code) => {
        onEnd(code);
    });

    process.on("error", (err) => {
        onError(err);
    });

    return process;
}

module.exports = { executeCommand };
