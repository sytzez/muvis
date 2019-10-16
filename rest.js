const REST = (() => {
  let token = '';

  const call = (url, init, callback) =>
    fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json())
      .then(data => callback(null, data))
      .catch(callback);

  const getProjects = callback =>
    call('projects', {}, callback);
  
  const getProjectContent = (id, callback) =>
    call(`projects/${id}`, {}, callback);
  
  const setProjectContent = (id, content, callback) =>
    call(`projects/${id}`, {
      method: 'POST',
      body: JSON.stringify(content),
    }, callback);
  
  return {
    getProjects,
    getProjectContent,
    setProjectContent,
  };
})();