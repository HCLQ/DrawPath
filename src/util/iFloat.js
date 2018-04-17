
const pow10=e=>Math.pow(10,e),
    max=(a,b)=>Math.max(a,b),
    reg=new RegExp(/^\d+\.?(\d*)$/);
class iFloat {
    constructor(num) {
        switch (typeof num) {
            case "string":
                let arr = num.match(reg);
                if (arr) {
                    this.value = Number(num);
                    this.string = num;
                    this.dec = arr[1].length;
                } else {
                    this.value = 0;
                    this.string = "0";
                    this.dec = 0;
                }
                break;
            case "number":
                this.value = num;
                this.string = num.toString();
                this.dec = this.string.match(reg)[1].length;
                break;
            default:
                this.value = 0;
                this.string = "0";
                this.dec = 0;
        }
        this._big = Number(this.string.replace(".", ""));
    }
    toString() {
        return this.string;
    }
    valueOf() {
        return this.value;
    }
    add(num1) {
        num1=format(this,num1);
        let dec=pow10(max(this.dec, num1.dec));
        return new iFloat((this.value*dec + num1.value*dec) / dec);
    }

    sub(num1){
        num1=format(this,num1);
        let dec=pow10(max(this.dec, num1.dec));
        return new iFloat((this.value*dec - num1.value*dec) / dec);
    }

    div(num1){
        num1=format(this,num1);
        return  new iFloat((this._big/num1._big)*pow10(num1.dec-this.dec));
    }

    mul(num1) {
        num1=format(this,num1);
        return new iFloat(this._big * num1._big / pow10(this.dec + num1.dec));
    }
}
export default function(num){
    return new iFloat(num);
};

function format(ifl,num1){
    return num1=num1===ifl.value||num1===ifl.string?ifl:new iFloat(num1);
}


