export interface DossierMedical {
  iddossier?: string;
  patient_id: string;
  datecreation?: Date;
  datemaj?: Date;
}

export interface DocumentMedical {
  iddocument?: string;
  dossier_id: string;
  nom: string;
  type?: string;
  url?: string;
  mimetype?: string;
  taillekb?: number;
  dateupload?: Date;
  ispublic?: boolean;
}

export interface CreateDocumentRequest {
  dossier_id: string;
  nom: string;
  type?: string;
  url?: string;
  mimetype?: string;
  taillekb?: number;
  ispublic?: boolean;
}

export interface CreateOrGetDossierResponse {
  dossier: DossierMedical;
  created: boolean;
}


