export class FileToInject {
    filePath: string;
    code: string;
}

export class ExecInfos {
    description: string;
    langage: string;
    bootFileTemplate: FileToInject;
    newFileTemplate: FileToInject;
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

