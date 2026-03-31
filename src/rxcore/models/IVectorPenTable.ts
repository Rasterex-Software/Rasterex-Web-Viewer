
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
    setcolor:(pcolor : string) => void;
    getcolor:() => string;
    setwidth:(pwidth : number) => void;
    getwidth:() => number;
    getdisplaywidth:() => number;
    setstyle:(pstyle : number) => void; //check type
    setOriginalwidth :(pwidth : number) => void;
    setdisplaywidth :(pwidth : number) => void;
    setOriginalcolor:(pcolor : string) => void;
    setOriginalStyle:(pstyle : number) => void; //check type
    setarrayindex:(indx : number) => void;
    getarrindex:() => number;
    setunitwidth:(uwidth : number) => void;

}


export interface IVectorPenTable {
    pens: Array<IVectorPen>;
    changed: boolean;

    getPen: (index: number) => IVectorPen;

    setChanged?: (value: boolean) => void;
    isChanged?: () => boolean;
    markChanged?: () => void;
}

