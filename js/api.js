import { colleges } from './data.js';

// API layer abstraction to support local data + future endpoint replacement
export const API = {
  async getColleges() {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => resolve([...colleges]), 80);
      } catch (error) {
        reject(error);
      }
    });
  },

  async getCollegeById(id) {
    return new Promise((resolve, reject) => {
      try {
        const college = colleges.find((c) => c.id === Number(id));
        resolve(college || null);
      } catch (error) {
        reject(error);
      }
    });
  }
};
