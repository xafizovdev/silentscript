const toClassName = (key: string) => `ss-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

const styles = new Proxy({} as Record<string, string>, {
  get: (_target, key) => toClassName(String(key)),
});

export default styles;
