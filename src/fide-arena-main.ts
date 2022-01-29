import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '@env';
import 'hammerjs';
import 'moment-duration-format';
import { FideBrowserModule } from './modules/fide-browser.module';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic()
    .bootstrapModule(FideBrowserModule)
    .catch(err => console.error(err));
});
