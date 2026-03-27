const { executeCommand } = require("../executor");

describe("executeCommand()", () => {
    it("should stream stdout data and call onEnd with exit code 0", (done) => {
        const chunks = [];
        executeCommand(
            "echo hello_infrastack",
            (data) => chunks.push(data),
            (code) => {
                expect(chunks.join("").trim()).toBe("hello_infrastack");
                expect(code).toBe(0);
                done();
            },
            (err) => done(err)
        );
    });

    it("should call onEnd with non-zero code on failure", (done) => {
        executeCommand(
            "exit 1",
            () => {},
            (code) => {
                expect(code).not.toBe(0);
                done();
            },
            (err) => done(err)
        );
    });

    it("should stream stderr output as well", (done) => {
        const chunks = [];
        executeCommand(
            "echo error_msg >&2",
            (data) => chunks.push(data),
            (code) => {
                const output = chunks.join("");
                expect(output).toContain("error_msg");
                done();
            },
            (err) => done(err)
        );
    });
});
