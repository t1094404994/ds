export type K = number | string;
/**
 * 词条(字典)结构
 */
export default class Entry<V> {
  public key: K;
  public value: V;
  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}
