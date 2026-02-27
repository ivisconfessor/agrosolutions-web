/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    // Remover o spinner global quando a aplicação termina de carregar
    const spinner = document.getElementById('nb-global-spinner');
    if (spinner) {
      spinner.style.display = 'none';
      // Remove do DOM após animação
      setTimeout(() => {
        spinner.parentNode?.removeChild(spinner);
      }, 500);
    }
  })
  .catch(err => {
    console.error('Erro ao inicializar aplicação:', err);
  });

