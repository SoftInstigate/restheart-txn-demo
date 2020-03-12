export class ObjecId {
    constructor(oid: string) {
        this.$oid = oid;
     }

    $oid: string;
}

export class Palette {
    _id: ObjecId;
    name: string;

    constructor(_id: ObjecId, name: string) {
       this._id = _id;
       this.name = name;
    }
}

export class Color {
    _id: ObjecId;
    name: string;
    hex: string;

    constructor(_id: ObjecId, name: string, hex: string) {
       this._id = _id;
       this.name = name;
       this.hex = hex;
    }
}
