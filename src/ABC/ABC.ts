interface Constructor<T> {
    new(...args):T;
    prototype:T;
}

class D {
    test() {
        var a = new A();
        var b = new B();
        a.a(b.b()).c();
        a.onEvent(() => b.fire())

        a.create(B).c();
    }
}

class C {
    c() {}
}

class B {
    c() {}
    b() {
        return new B();
    }
    fire(){}
}

class A {
    a(b:B):C {
        return new C();
    }
    onEvent(cb){}

    create<D>(D:Constructor<D>) {
        return new D();
    }
}