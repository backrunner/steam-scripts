export class PromiseExecutionQueue {
  constructor(timeInterval, multiBar, name = 'Queue') {
    this.timeInterval = timeInterval;
    this.queue = [];
    this.results = [];
    this.inProgress = false;
    this.name = name;

    // Add a bar to the MultiBar instance
    this.progressBar = multiBar.create(100, 0, {
      queueName: this.name,
    });
  }

  add(promiseFunction) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promiseFunction,
        resolve,
        reject,
      });
      this.progressBar.setTotal(this.queue.length);
    });
  }

  async processQueue() {
    if (this.inProgress) return;
    this.inProgress = true;

    while (this.queue.length > 0) {
      const { promiseFunction, resolve, reject } = this.queue.shift();

      try {
        const result = await promiseFunction();
        this.results.push(result);
        resolve(result);
      } catch (error) {
        reject(error);
      }

      this.progressBar.increment();
      await this._wait(this.timeInterval);
    }

    this.progressBar.stop();
    this.inProgress = false;
  }

  _wait(time) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}
