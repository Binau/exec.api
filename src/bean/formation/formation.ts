export interface IFormation {
  nom: string;
  dateCreation : Date;
  dateDeModification : Date;
  version : number;
  auteurs : string[];
  id : string;
  description : string;
  motCles : string[];
  etapesFormation : EtapeFormation[];
  avancement : string;
  image : string;
  idCycleFormation : string;
}


export interface EtapeFormation {
  cour : string;
  exercice : Exercice;
}

export interface Exercice {
  id : string;
  contenu : string;
}
