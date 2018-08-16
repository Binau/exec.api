import {HttpServer} from "http-typescript";

import {FormationHttp} from './http/formation.http';
import {UtilisateurHttp} from './http/utilisateur.http';

import {TestHttp} from "./http/docker-engine/test.http";
import {ExecWs} from "./http/docker-engine/exec.ws";
import {TestWs} from "./http/docker-engine/test.ws";
import {CoreEngine} from "./docker-engine/core.engine";
import {ExecHttp} from "./http/docker-engine/exec.http";
import {AppContext} from "./common/app.context";
import {LogService} from "./common/log.service";
import {FileUtils} from "./tool/file.utils";
import {IndexConf} from "./index.conf";

class App {

    private static CONF_FILE_PATH = 'data/app.conf.json';
    private appContext: AppContext = AppContext.instance;

    public async run() {

        if (!await this.initApp()) {
            this.appContext.logService.error('Erreur au chargement, arrêt de l\'application');
            return;
        }

        await new HttpServer()
            //.debug()
            //
            .loadHttp(new FormationHttp(), '/rest')
            .loadHttp(new UtilisateurHttp(), '/rest')

            // Geston des tests et executions
            .loadHttp(new TestHttp(), '/rest/tests')
            .loadHttp(new ExecHttp(), '/rest/execs')
            .loadWs(TestWs, '/ws/runTest')
            .loadWs(ExecWs, '/ws/exec')

            // listen
            .listen(this.appContext.appConf.port);
        this.appContext.logService.log(`Application démarrée sur le port ${this.appContext.appConf.port}`);

    }

    /**
     * Initialisation de l'application et retourne des messages d'erreurs
     */
    private async initApp(): Promise<boolean> {

        // Initialisation ud service de log
        this.appContext.logService = new LogService();
        this.appContext.logService.log(`Initialisation de l'application ...`);

        // Chargement du fichier de configuration
        this.appContext.logService.log(`Chargement du fichier de configuration ${App.CONF_FILE_PATH}...`,);
        try {
            this.appContext.appConf = await FileUtils.loadConf<IndexConf>(App.CONF_FILE_PATH);
        } catch (e) {
            this.appContext.logService.error(`Problème au chargement du fichier de configuration`, e);
            return false;
        }

        // Chargement du docker Engine
        if(!await CoreEngine.loadInContext()) return false;

        return true;
    }
}

// Lancement de l'application
try {
    new App().run();
}
catch (e) {
    // Log si l'erreur n'est pas gérée
    console.log(e);
}
