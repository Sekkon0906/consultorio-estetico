import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getCharlasAPI = async () => {
  const res = await axios.get(`${API}/charlas`);
  return res.data.charlas;
};

export const addCharlaAPI = async (data: any) => {
  const res = await axios.post(`${API}/charlas`, data);
  return res.data.charla;
};

export const updateCharlaAPI = async (id: number, data: any) => {
  const res = await axios.put(`${API}/charlas/${id}`, data);
  return res.data.charla;
};

export const deleteCharlaAPI = async (id: number) => {
  await axios.delete(`${API}/charlas/${id}`);
};
