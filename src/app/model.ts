export interface ObjectId {
    $oid: string;
}

export interface Palette {
    _id: ObjectId;
    name: string;
}

export interface Color {
    _id: ObjectId;
    name: string;
    hex: string;
}
