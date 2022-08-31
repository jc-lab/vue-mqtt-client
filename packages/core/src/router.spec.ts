import {Router} from './router';

describe('router test', () => {
  const router = new Router<any>();
  let results: Record<number, boolean> = {};

  router.subscribe('user/+/hello', (data) => {
    results['1'] = true;
  });

  router.subscribe('user/1234/hello', (data) => {
    results['2'] = true;
  });

  router.subscribe('user/1234/#', (data) => {
    results['3'] = true;
  });

  router.subscribe('user/2345/hello', (data) => {
    results['4'] = true;
  });

  router.subscribe('user/2345/+', (data) => {
    results['5'] = true;
  });

  it ('samples 1', () => {
    results = {};
    router.publish('user/1234/hello', null);
    expect(Object.keys(results)).toEqual(['1', '2', '3']);
  });

  it ('samples 2', () => {
    results = {};
    router.publish('user/2345/hello', null);
    expect(Object.keys(results)).toEqual(['1', '4', '5']);
  });
});
