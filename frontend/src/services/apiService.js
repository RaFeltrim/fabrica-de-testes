import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

class ApiService {
  async fetchResults() {
    try {
      const response = await axios.get(`${API_BASE_URL}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  }

  async postResult(resultData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/results`, resultData);
      return response.data;
    } catch (error) {
      console.error('Error posting result:', error);
      throw error;
    }
  }

  async getResultById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/results/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result:', error);
      throw error;
    }
  }

  async fetchProjects() {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
}

export default new ApiService();
