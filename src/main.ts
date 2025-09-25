// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from 'app/app.component';
// import { appConfig } from 'app/app.config';
//
// bootstrapApplication(AppComponent, appConfig).catch((err) =>
//   console.error(err)
// );
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';

// Add provideAnimations() to your providers
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [...(appConfig.providers || []), provideAnimations()],
}).catch((err) => console.error(err));
