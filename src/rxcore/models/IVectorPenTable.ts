
export interface IVectorPen {
    penindex : number;
    arrayindex : number;
    originalcolor : string; //html color string
    color : string; //html color string
    originalstyle : number; // pen style 
    style : number; // pen style 
    penwidth : number; //pen width
    originalpenwidth : number; //pen width
    displaywidth : number; //pen width in display scale
    unitwidth : number; //pen width in unit scale
    resetcolor:() => void;
    resetwidth:() => void;
    resetstyle:() => void;

}

export interface IVectorPenTable {
    pens: Array<IVectorPen>;
    changed : boolean;
    getPen: (index: number) => IVectorPen;
}
