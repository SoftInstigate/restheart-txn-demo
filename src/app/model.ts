export class ObjectId {
    constructor(oid: string) {
        this.$oid = oid;
     }

    $oid: string;
}

export class Palette {
    _id: ObjectId;
    name: string;

    constructor(_id: ObjectId, name: string) {
       this._id = _id;
       this.name = name;
    }

    id(): ObjectId {
        return this._id;
    }
}

export class Color {
    _id: ObjectId;
    name: string;
    hex: string;

    constructor(_id: ObjectId, name: string, hex: string) {
       this._id = _id;
       this.name = name;
       this.hex = hex;
    }

    id(): ObjectId {
        return this._id;
    }
}
