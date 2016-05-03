import Greeter = require("./Greeter");

class Person extends Greeter {
    private simpleGreeter:Greeter;
    constructor(private name:string) {
        super();
        this.simpleGreeter = new Greeter();
    }

    greet() {
        return super.greet() + ', my name is ' + this.name;
    }
    
    simpleGreet() {
        var oneMoreGreeter = new Greeter();
        oneMoreGreeter.greet();
        var test = this.nameGetter;
        this.name = this.nameGetter;
        this.nameSetter = this.nameGetter;
        return this.simpleGreeter.greet();
    }

    get nameGetter():string {
        return name;
    }

    set nameSetter(value:string) {
        this.name = value;
    }
}
export = Person;