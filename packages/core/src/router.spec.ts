import {Router} from './router';

describe('router test', () => {
  const router = new Router<any>();

  router.subscribe('user/+/hello', 1);

  router.subscribe('user/1234/hello', 2);

  router.subscribe('user/1234/#', 3);

  router.subscribe('user/2345/hello', 4);

  router.subscribe('user/2345/+', 5);

  it ('samples 1', () => {
    const results = router.find('user/1234/hello');
    expect(Object.keys(results)).toEqual(['1', '2', '3']);
  });

  it ('samples 2', () => {
    const results = router.find('user/2345/hello');
    expect(Object.keys(results)).toEqual(['1', '4', '5']);
  });
});
