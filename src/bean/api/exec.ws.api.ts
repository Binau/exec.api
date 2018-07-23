
export class FileToInject {
    filePath: string;
    code: string;
}

export class ExecParam {
    // Id de l'image
    idImage: string;
    // Codes à injecter
    files: FileToInject[];

}



export class ExecLog {
    isInfo?: true;
    isError?: true;

    message?: string;
}

