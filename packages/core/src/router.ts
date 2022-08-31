import * as uuid from 'uuid';

export type ConsumerId = string;

interface ConsumerHolder<T> {
  pattern: RegExp;
  id: string;
  data: T;
}

export class Router<T> {
  private readonly _routes: ConsumerHolder<T>[] = [];

  public subscribe(topicPattern: string, data: T): ConsumerId {
    const id = uuid.v4();
    const regexp = new RegExp(topicPattern
      .replace('+', '([^/]+)')
      .replace('#', '(.+)'));

    regexp.lastIndex = 0;
    this._routes.push({
      id,
      pattern: regexp,
      data
    });
    return id;
  }

  public unsubscribe(id: ConsumerId) {
    const index = this._routes.findIndex((v) => v.id === id);
    if (index >= 0) {
      this._routes.splice(index, 1);
    }
  }

  public find(topic: string): T[] {
    return this._routes
      .filter(v => {
        v.pattern.lastIndex = 0;
        return v.pattern.test(topic);
      })
      .map(v => v.data);
  }
}
