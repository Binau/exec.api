
let oldStdoutWrite = process.stdout.write.bind(process.stdout);

exports.oldStdOutWrite = oldStdoutWrite;
exports.overrideStdout = ()=>{

    process.stdout.write = (datas, encoding, callback) => {

        let completeData = {
            isInfo: true,
            message: datas
        };

        oldStdoutWrite(JSON.stringify(completeData), encoding, callback);
    }

};


exports.printTestResult = (result)=>{
    let data = {
        isInfo: true,
        isResult: true,
        result: result
    };
    oldStdoutWrite(JSON.stringify(data));
};
