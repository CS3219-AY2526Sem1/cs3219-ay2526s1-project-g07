import { register } from 'esbuild-register/dist/node';
import Jasmine from 'jasmine';

register({
  target: 'es2020',
  format: 'cjs',
  extensions: ['.ts', '.tsx']
});

const j = new Jasmine();
j.loadConfigFile('spec/support/jasmine.json');
j.execute();
