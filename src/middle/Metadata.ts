export interface IClass {
    text:string;
    name:string;
    path:string;
    line:string;
    methods:{[key:string]:IMethod};
}

export interface IMethod {
    text:string,
    path:string;
    line:string;
    calls:ICall[]
}

export interface ICall {
    target:string;
    name:string;
    text:string;
    path:string;
    line:string;
}