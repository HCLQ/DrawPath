const RELATIVE_INSTRUCTS = ['m', 'l', 'v', 'h', 'c', 'q', 'z', 's', 'a', 't'],
    INSTRUCTS = RELATIVE_INSTRUCTS.reduce(function (arr, v) {
        arr.push(v.toUpperCase());
        arr.push(v);
        return arr;
    }, []),
    CMD_REG = new RegExp(`(${INSTRUCTS.join('|')})[^${INSTRUCTS.join('')}]*`, 'g'),
    NUM_REG = new RegExp(/-?\d+\.?\d*/, 'g');

function parse(path) {
    let item, reg = CMD_REG,
        instructs = [];
    while ((item = reg.exec(path)) != null) {
        let numReg = NUM_REG,
            instructBody = [],
            num;
        while ((num = numReg.exec(item[0])) != null) {
            instructBody.push(parseFloat(num[0]));
        }
        instructs.push({
            type: item[0][0],
            params: instructBody
        });
    }
    return instructs;
}

export default parse;