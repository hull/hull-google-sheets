function wrap(methodName) {
  let counter = 0;
  return (...args) => {
    counter += 1;
    const startTime =  new Date();
    // console.debug(`Service.${methodName} - request[${counter}]`, JSON.stringify(args));
    return new Promise((resolve, reject) => {
      return google.script.run
        .withSuccessHandler((res) => {
          const took = new Date() - startTime;
          // console.debug(`Service.${methodName} - result[${counter} - ${took}ms] - `, JSON.stringify(res));
          resolve(res);
        })
        .withFailureHandler((err) => {
          // console.debug(`Service.${methodName} - err`, err);
          reject(err);
        })
        [methodName].apply(google.script.run, args);
    });
  };
}

const Service = window.GoogleServiceMock || {};

if (window.google && window.google.script) {
  Object
    .keys(google.script.run)
    .forEach((k) => { Service[k] = wrap(k); });
}

export default Service;
