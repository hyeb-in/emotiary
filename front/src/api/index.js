import { formDataInstance, instance } from './instance';

const baseURL = 'http://localhost:3001';

const userToken = () => localStorage.getItem('userToken');

const get = async (endpoint) => {
  try {
    console.log(`GET: ${baseURL}${endpoint}`);
    const res = await instance.get(endpoint);
    if (res.message) {
      console.log(`MESSAGE: ${res.message}`, 'color: #a25cd1;');
    }
    return res;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      console.log(`ERROR MESSAGE: ${err.response.data.message}`);
    }
    console.error('GET ERROR', err);
    throw err;
  }
};

const post = async (endpoint, data) => {
  try {
    console.log(`POST: ${baseURL}${endpoint}`);
    console.log(`DATA: ${JSON.stringify(data)}`);
    const res = await instance.post(endpoint, data);
    if (res.message) {
      console.log(`MESSAGE: ${res.message}`, 'color: #ffb300c9;');
    }
    return res;
  } catch (err) {
    console.error('POST ERROR', err);
    if (err.response && err.response.data && err.response.data.message) {
      console.log(`ERROR MESSAGE: ${err.response.data.message}`);
    }
    throw err;
  }
};

const registerPost = async (endpoint, data) => {
  try {
    console.log(`POST: ${baseURL}${endpoint}`);
    console.log(`DATA: ${JSON.stringify(data)}`);
    const res = await instance.post(endpoint, data);
    if (res.message) {
      console.log(`MESSAGE: ${res.message}`, 'color: #00b627;');
    }
    return res;
  } catch (err) {
    console.error('POST ERROR', err);
    if (err.response && err.response.data && err.response.data.message) {
      console.log(`ERROR MESSAGE: ${err.response.data.message}`);
    }
    throw err;
  }
};

const postForm = async (endpoint, data) => {
  try {
    console.log(`POST: ${baseURL}${endpoint}`);
    console.log(`DATA: ${JSON.stringify(data)}`);
    const res = await formDataInstance.post(endpoint, data);
    if (res.message) {
      console.log(`MESSAGE: ${res.message}`, 'color: #1500ff;');
    }
    return res;
  } catch (err) {
    console.error('POST ERROR', err);
    if (err.response && err.response.data && err.response.data.message) {
      console.log(`ERROR MESSAGE: ${err.response.data.message}`);
    }
    throw err;
  }
};

const put = async (endpoint, data) => {
  try {
    console.log(`PUH: ${baseURL}${endpoint}`);
    console.log(`DATA: ${JSON.stringify(data)}`);
    const filteredData = {};
    for (const key in data) {
      if (data[key] !== '') {
        filteredData[key] = data[key];
      }
    }
    console.log(`FILTERED DATA: ${JSON.stringify(filteredData)}`);
    const res = await instance.put(endpoint, filteredData);
    if (res.message) {
      console.log(`MESSAGE: ${res.message}`, 'color: #ff0090;');
    }
    return res;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      console.log(`ERROR MESSAGE: ${err.response.data.message}`);
    }
    console.error('PUT ERROR', err);
    throw err;
  }
};

const del = async (endpoint) => {
  try {
    console.log(`DELTE: ${baseURL}${endpoint} ${userToken}`);
    const res = await instance.delete(endpoint);
    if (res.message) {
      console.log(`MESSAGE: ${res.message}`, 'color: #ff0000;');
    }
    return res;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      console.log(`ERROR MESSAGE: ${err.response.data.message}`);
    }
    console.error('DELETE ERROR', err);
    throw err;
  }
};
export { get, post, registerPost, postForm, put, del as delete };