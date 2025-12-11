import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

class ApiService {
  async fetchResults(dateRange = null) {
    try {
      let url = `${API_BASE_URL}/results`;
      
      // Add date range parameters if provided
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
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
}

export default new ApiService();
