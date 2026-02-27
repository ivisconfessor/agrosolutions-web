/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrls: {
    usuario: 'http://localhost:5059',
    sensores: 'http://localhost:5164',
    monitoracao: 'http://localhost:5165',
    propriedade: 'http://localhost:5163',
  },
  openWeatherMap: {
    apiKey: '8837b9c828ee1d67b3f788ec382f5449',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
};
