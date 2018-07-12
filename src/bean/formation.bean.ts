export class FormationBean {

    public nom: string;
    public dateCreation : Date;
    public dateMaj : Date;
    public version : number;
    public auteurs : string[];
    public id : string;
    public motCles : string[];
    public etapesFormation : EtapeFormation[];
}

export class EtapeFormation {
    public cour : string;
    public exercice : Exercice;
}

export class Exercice {
    public id : string;
    public contenu : string;
}

